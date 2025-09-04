import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Twilio client instance
const client = twilio(accountSid, authToken);

// Helper function to validate phone number
export function validatePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid Turkish phone number
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+9' + cleaned;
  } else if (cleaned.length === 10) {
    return '+90' + cleaned;
  }
  
  // Return as is if it's already in international format
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  return null;
}

// Send SMS function
export async function sendSMS(to, body, webhookUrl = null) {
  try {
    const validatedNumber = validatePhoneNumber(to);
    if (!validatedNumber) {
      throw new Error('Invalid phone number format');
    }

    const messageOptions = {
      body,
      from: twilioPhoneNumber,
      to: validatedNumber
    };

    if (webhookUrl) {
      messageOptions.statusCallback = webhookUrl;
    }

    const message = await client.messages.create(messageOptions);
    return {
      success: true,
      sid: message.sid,
      status: message.status,
      to: message.to,
      dateCreated: message.dateCreated
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Make voice call function
export async function makeVoiceCall(to, twimlUrl, webhookUrl = null) {
  try {
    const validatedNumber = validatePhoneNumber(to);
    if (!validatedNumber) {
      throw new Error('Invalid phone number format');
    }

    const callOptions = {
      url: twimlUrl,
      to: validatedNumber,
      from: twilioPhoneNumber,
      record: true,
      recordingStatusCallback: webhookUrl,
      statusCallback: webhookUrl,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    };

    const call = await client.calls.create(callOptions);
    return {
      success: true,
      sid: call.sid,
      status: call.status,
      to: call.to,
      duration: call.duration
    };
  } catch (error) {
    console.error('Voice call error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate TwiML for voice calls
export function generateTwiML(message, recordingCallback = null) {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Add greeting message
  twiml.say({
    voice: 'alice',
    language: 'tr-TR'
  }, message);
  
  // Add pause
  twiml.pause({ length: 2 });
  
  // Add recording instruction if callback provided
  if (recordingCallback) {
    twiml.say({
      voice: 'alice',
      language: 'tr-TR'
    }, 'Mesajınızı bırakmak için bip sesinden sonra konuşun. Bitirdiğinizde kare tuşuna basın.');
    
    twiml.record({
      maxLength: 30,
      transcribe: true,
      transcribeCallback: recordingCallback,
      finishOnKey: '#'
    });
    
    twiml.say({
      voice: 'alice',
      language: 'tr-TR'
    }, 'Teşekkür ederiz. Mesajınız kaydedildi.');
  }
  
  return twiml.toString();
}

// Get call status
export async function getCallStatus(callSid) {
  try {
    const call = await client.calls(callSid).fetch();
    return {
      success: true,
      status: call.status,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime
    };
  } catch (error) {
    console.error('Error fetching call status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get message status
export async function getMessageStatus(messageSid) {
  try {
    const message = await client.messages(messageSid).fetch();
    return {
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateDelivered: message.dateDelivered
    };
  } catch (error) {
    console.error('Error fetching message status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get transcription
export async function getTranscription(transcriptionSid) {
  try {
    const transcription = await client.transcriptions(transcriptionSid).fetch();
    return {
      success: true,
      text: transcription.transcriptionText,
      status: transcription.status
    };
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Batch send messages
export async function batchSendMessages(recipients, body, webhookUrl = null) {
  const results = [];
  
  for (const recipient of recipients) {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await sendSMS(recipient.phone_number, body, webhookUrl);
    results.push({
      recipientId: recipient.id,
      recipientName: recipient.name,
      ...result
    });
  }
  
  return results;
}

// Batch make calls
export async function batchMakeCalls(recipients, twimlUrl, webhookUrl = null) {
  const results = [];
  
  for (const recipient of recipients) {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await makeVoiceCall(recipient.phone_number, twimlUrl, webhookUrl);
    results.push({
      recipientId: recipient.id,
      recipientName: recipient.name,
      ...result
    });
  }
  
  return results;
}

export default client;