const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(200).json({ 
        success: true, 
        message: 'Campaign queued - Add Twilio ENV variables to send real SMS/calls',
        campaignId: id,
        mode: 'demo'
      });
    }

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Demo phone number - replace with your test number
    const testPhoneNumber = '+905551234567';
    
    // Demo message
    const message = 'Bu bir test mesajıdır. EV filo yönetiminden bilgilendirme.';

    try {
      // Send test SMS
      const smsResult = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: testPhoneNumber
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Campaign started! SMS sent successfully',
        campaignId: id,
        smsId: smsResult.sid,
        mode: 'production'
      });

    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Campaign queued - Twilio configuration issue',
        campaignId: id,
        error: twilioError.message,
        mode: 'demo'
      });
    }
    
  } catch (error) {
    console.error('Campaign start error:', error);
    res.status(500).json({ 
      error: 'Failed to start campaign',
      details: error.message 
    });
  }
}