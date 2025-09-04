import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const campaigns = await kv.get('campaigns') || [];
    const campaign = campaigns.find(c => c.id === id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Get drivers
    const drivers = await kv.get('drivers') || [];
    const targetDrivers = drivers.filter(d => 
      campaign.target_driver_ids.includes(d.id)
    );
    
    // Update campaign status
    campaign.status = 'ongoing';
    campaign.started_at = new Date().toISOString();
    await kv.set('campaigns', campaigns);
    
    // Start sending communications
    for (const driver of targetDrivers) {
      const endpoint = campaign.type === 'voice' 
        ? '/api/twilio/voice' 
        : '/api/twilio/sms';
      
      // Make async call to Twilio API
      fetch(`${process.env.VERCEL_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          driverId: driver.id,
          phoneNumber: driver.phone_number,
          message: campaign.template_content
        })
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Campaign started successfully' 
    });
  } catch (error) {
    console.error('Campaign start error:', error);
    res.status(500).json({ error: 'Failed to start campaign' });
  }
}