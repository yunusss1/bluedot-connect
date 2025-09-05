// pages/api/twilio/voice.js - Server error fix
const twilio = require('twilio');

export default function handler(req, res) {
  console.log('=== VOICE ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);

  try {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Get message from query params (kampanya mesajı)
    const message = req.query.message || 'Hello! This is a test call from BlueDot Connect.';
    
    console.log('📢 Speaking message:', message);
    
    // Start real-time transcription
    const start = twiml.start();
    start.transcription({
      statusCallbackUrl: `${process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app'}/api/twilio/transcriptions`,
      languageCode: 'en-US',
      track: 'both_tracks',
      transcriptionEngine: 'google'
    });

    // Speak the message
    twiml.say({ 
      voice: 'Polly.Joanna-Generative', 
      language: 'en-US' 
    }, message);

    // Add pause for response
    twiml.pause({ length: 2 });

    // Optional: Add a simple prompt for response
    twiml.say({ 
      voice: 'Polly.Joanna-Generative', 
      language: 'en-US' 
    }, 'Please share your response after the beep.');

    // Record response (optional - for backup)
    twiml.record({
      maxLength: 30,
      finishOnKey: '#',
      transcribe: false, // We use real-time transcription instead
    });

    // Generate TwiML XML
    const twimlXml = twiml.toString();
    console.log('📋 Generated TwiML:', twimlXml);

    // Set proper headers and return TwiML
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twimlXml);
    
  } catch (error) {
    console.error('❌ Voice endpoint error:', error);
    
    // Return simple TwiML even on error
    const errorTwiml = new twilio.twiml.VoiceResponse();
    errorTwiml.say('Sorry, there was an error processing your call.');
    
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(errorTwiml.toString());
  }
}
