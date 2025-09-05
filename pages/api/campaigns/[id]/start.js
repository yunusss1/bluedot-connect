import { getCampaignById, getDrivers, updateCampaign } from '../../../../lib/memory-store';
import { sendSMS, makeVoiceCall } from '../../../../lib/twilio-helpers';

export default async function handler(req, res) {
  // Geri kalan kod aynı...
  console.log('🚀 Campaign Start API Called:', req.method, req.query.id);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  try {
    // Get campaign from memory store
    const campaign = getCampaignById(id);
    if (!campaign) {
      console.log('❌ Campaign not found:', id);
      return res.status(404).json({ error: 'Campaign not found' });
    }

    console.log('📋 Found campaign:', campaign.name, 'Type:', campaign.type);

    // Get all drivers
    const allDrivers = getDrivers();
    console.log('👥 Total drivers available:', allDrivers.length);

    // Filter target drivers
    const targetDrivers = allDrivers.filter(driver => 
      campaign.target_driver_ids.includes(driver.id)
    );
    
    console.log('🎯 Target drivers for campaign:', targetDrivers.length);

    if (targetDrivers.length === 0) {
      return res.status(400).json({ 
        error: 'No target drivers found',
        details: 'Campaign has no valid driver targets'
      });
    }

    // Update campaign status
    updateCampaign(id, { 
      status: 'ongoing',
      started_at: new Date().toISOString()
    });

    // Send communications
    const results = [];
    let successCount = 0;

    for (const driver of targetDrivers) {
      console.log(`📤 Sending ${campaign.type} to ${driver.name} (${driver.phone_number})`);
      
      let result;
      if (campaign.type === 'voice') {
        result = await makeVoiceCall(driver.phone_number, campaign.template_content, {
          record: true
        });
      } else {
        result = await sendSMS(driver.phone_number, campaign.template_content);
      }

      results.push({
        driverId: driver.id,
        driverName: driver.name,
        phone: driver.phone_number,
        ...result
      });

      if (result.success) {
        successCount++;
      }

      // Add delay between calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update campaign with results
    updateCampaign(id, { 
      status: successCount > 0 ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      results: results
    });

    console.log(`✅ Campaign completed: ${successCount}/${targetDrivers.length} sent successfully`);

    return res.status(200).json({
      success: true,
      message: `Campaign started! ${successCount}/${targetDrivers.length} messages sent successfully`,
      campaignId: id,
      results: results,
      summary: {
        total: targetDrivers.length,
        successful: successCount,
        failed: targetDrivers.length - successCount
      }
    });

  } catch (error) {
    console.error('💥 Campaign start error:', error);
    
    // Update campaign status to failed
    try {
      updateCampaign(id, { 
        status: 'failed',
        error: error.message,
        failed_at: new Date().toISOString()
      });
    } catch (updateError) {
      console.error('Failed to update campaign status:', updateError);
    }
    
    return res.status(500).json({ 
      error: 'Failed to start campaign',
      details: error.message 
    });
  }
}
