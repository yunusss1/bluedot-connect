// pages/api/twilio/voice.js - 2024 güncel Real-Time Transcription API
import twilio from 'twilio';

export default function handler(req, res) {
  console.log('=== VOICE ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);

  try {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Get message from query params
    const message = req.query.message || 'Hello! This is a test call from BlueDot Connect.';
    
    console.log('📢 Speaking message:', message);
    
    // NEW SYNTAX: Start Real-Time Transcription (2024 API)
    const start = twiml.start();
    const transcription = start.transcription({
      statusCallbackUrl: `${process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app'}/api/twilio/transcriptions`,
      languageCode: 'en-US',
      track: 'both_tracks'
    });

    // Speak the message
    twiml.say({ 
      voice: 'Polly.Joanna-Generative', 
      language: 'en-US' 
    }, message);

    // Add pause for user response
    twiml.pause({ length: 2 });

    // Prompt for response
    twiml.say({ 
      voice: 'Polly.Joanna-Generative', 
      language: 'en-US' 
    }, 'Please share your response. Press pound key when finished.');

    // Record response (backup transcription)
    twiml.record({
      maxLength: 30,
      finishOnKey: '#',
      transcribe: false // Real-time transcription handles this
    });

    // Thank you message
    twiml.say({ 
      voice: 'Polly.Joanna-Generative', 
      language: 'en-US' 
    }, 'Thank you for your response. Goodbye.');

    // Generate TwiML XML
    const twimlXml = twiml.toString();
    console.log('📋 Generated TwiML:', twimlXml);

    // Return TwiML response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twimlXml);
    
  } catch (error) {
    console.error('❌ Voice endpoint error:', error);
    
    // Return minimal TwiML on error
    const errorTwiml = new twilio.twiml.VoiceResponse();
    errorTwiml.say('Sorry, there was an error. Please try again later.');
    
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(errorTwiml.toString());
  }
}
