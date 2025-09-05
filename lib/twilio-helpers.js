// lib/twilio-helpers.js - US ve Türkiye numaraları için güncel validation
const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Already in international format (+1 or +90 etc.)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Remove + and process digits
  const digitsOnly = cleaned.replace(/\D/g, '');
  
  // US format (10 digits or 11 with 1)
  if (digitsOnly.length === 10) {
    return '+1' + digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return '+' + digitsOnly;
  }
  
  // Turkish formats
  if (digitsOnly.startsWith('90') && digitsOnly.length === 12) {
    return '+' + digitsOnly;
  } else if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return '+9' + digitsOnly;
  } else if (digitsOnly.length === 10 && !digitsOnly.startsWith('1')) {
    return '+90' + digitsOnly;
  }
  
  // Return original if already looks international
  return phoneNumber.startsWith('+') ? phoneNumber : null;
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
      throw new Error(`Invalid phone number format: ${to}`);
    }

    console.log('📱 SMS attempt:', { from: process.env.TWILIO_PHONE_NUMBER, to: validatedNumber });

    const messageOptions = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: validatedNumber,
      ...options
    };

    const result = await client.messages.create(messageOptions);
    
    console.log('📱 SMS Sent Successfully:', { to: validatedNumber, sid: result.sid });
    
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
      throw new Error(`Invalid phone number format: ${to}`);
    }

    // Use external TwiML URL
    const baseUrl = process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app';
    const twimlUrl = `${baseUrl}/api/twilio/voice?message=${encodeURIComponent(message)}`;
    
    console.log('📞 Voice Call attempt:', { 
      from: process.env.TWILIO_PHONE_NUMBER, 
      to: validatedNumber, 
      twimlUrl 
    });

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
    
    console.log('📞 Voice Call Initiated Successfully:', { to: validatedNumber, sid: result.sid });
    
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
