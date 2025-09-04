// Twilio helpers - Works with or without ENV variables

const validatePhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Turkish phone number formats
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+9' + cleaned;
  } else if (cleaned.length === 10) {
    return '+90' + cleaned;
  }
  
  // International format
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  return null;
};

export const sendSMS = async (to, message, options = {}) => {
  // Check if Twilio is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('📱 SMS Simulated (missing Twilio ENV):', { to, message });
    return {
      success: true,
      sid: `sim_${Date.now()}`,
      status: 'sent',
      simulated: true
    };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const validatedNumber = validatePhoneNumber(to);
    if (!validatedNumber) {
      throw new Error('Invalid phone number format');
    }

    const messageOptions = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: validatedNumber,
      ...options
    };

    const result = await client.messages.create(messageOptions);
    
    console.log('📱 SMS Sent:', { to: validatedNumber, sid: result.sid });
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to
    };
  } catch (error) {
    console.error('📱 SMS Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const makeVoiceCall = async (to, message, options = {}) => {
  // Check if Twilio is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('📞 Voice Call Simulated (missing Twilio ENV):', { to, message });
    return {
      success: true,
      sid: `sim_call_${Date.now()}`,
      status: 'in-progress',
      simulated: true
    };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const validatedNumber = validatePhoneNumber(to);
    if (!validatedNumber) {
      throw new Error('Invalid phone number format');
    }

    // Use external TwiML URL (as per your doc)
    const baseUrl = process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app';
    const twimlUrl = `${baseUrl}/api/twilio/voice?message=${encodeURIComponent(message)}`;
    
    const callOptions = {
      url: twimlUrl,
      to: validatedNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${baseUrl}/api/twilio/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      ...options
    };

    const result = await client.calls.create(callOptions);
    
    console.log('📞 Voice Call Initiated:', { to: validatedNumber, sid: result.sid });
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to
    };
  } catch (error) {
    console.error('📞 Voice Call Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
