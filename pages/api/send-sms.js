// Ultra basit SMS gönderme API

export default async function handler(req, res) {
  console.log('=== SMS API CALLED ===');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, message } = req.body;
  
  // Twilio bilgilerini kontrol et
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return res.status(200).json({
      success: true,
      message: '📱 SMS simulated (missing Twilio ENV)',
      data: { to: phoneNumber, message: message },
      simulated: true
    });
  }

  try {
    // Twilio kullan
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    return res.status(200).json({
      success: true,
      message: '📱 SMS sent successfully!',
      sid: result.sid,
      status: result.status
    });
    
  } catch (error) {
    console.error('SMS Error:', error);
    
    return res.status(200).json({
      success: true,
      message: '📱 SMS simulated (Twilio error)',
      error: error.message,
      data: { to: phoneNumber, message: message },
      simulated: true
    });
  }
}
