import { sendSMS, makeVoiceCall, generateTwiML } from '../../../../lib/twilio.js';

// Get memory data from other APIs
let getCampaigns, getDrivers;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get campaigns and drivers from memory storage
    // We'll simulate this for now since we don't have shared memory
    
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(200).json({ 
        success: true, 
        message: 'Campaign queued - Add Twilio ENV variables to send real SMS/calls',
        campaignId: id,
        mode: 'demo'
      });
    }

    // For demo: simulate getting campaign data
    const demoDrivers = [
      {
        id: 'demo1',
        name: 'Demo Sürücü',
        phone_number: '+905551234567' // Replace with your test number
      }
    ];

    const demoCampaign = {
      id: id,
      type: 'voice', // or 'sms'
      template_content: 'Bu bir test mesajıdır. EV filo yönetiminden bilgilendirme.'
    };

    // Send communications
    const results = [];
    
    for (const driver of demoDrivers) {
      try {
        let result;
        
        if (demoCampaign.type === 'voice') {
          // Generate TwiML for voice call
          const twiml = generateTwiML(
            demoCampaign.template_content,
            `${process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app'}/api/twilio/transcription`
          );
          
          // Make voice call
          result = await makeVoiceCall(
            driver.phone_number,
            `data:application/xml,${encodeURIComponent(twiml)}`,
            `${process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app'}/api/twilio/status`
          );
        } else {
          // Send SMS
          result = await sendSMS(
            driver.phone_number,
            demoCampaign.template_content,
            `${process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app'}/api/twilio/status`
          );
        }
        
        results.push({
          driverId: driver.id,
          driverName: driver.name,
          ...result
        });
        
        // Add delay between calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error sending to ${driver.name}:`, error);
        results.push({
          driverId: driver.id,
          driverName: driver.name,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.status(200).json({ 
      success: true, 
      message: `Campaign started! ${successCount}/${results.length} messages sent successfully`,
      campaignId: id,
      results: results,
      mode: 'production'
    });
    
  } catch (error) {
    console.error('Campaign start error:', error);
    res.status(500).json({ 
      error: 'Failed to start campaign',
      details: error.message 
    });
  }
}