// pages/api/twilio/voice.js - TRANSCRIPTION AKTİF VERSİYON
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

    // ✅ REAL-TIME TRANSCRIPTION BAŞLAT
    const startTranscription = twiml.start();
    startTranscription.stream({
      url: 'wss://bluedot-connect.vercel.app/api/twilio/transcriptions',
      track: 'inbound_track'
    });

    // Record response with transcription
    twiml.record({
      maxLength: 30,
      finishOnKey: '#',
      transcribe: true, // ✅ TRANSCRIPTION AKTİF
      transcribeCallback: 'https://bluedot-connect.vercel.app/api/twilio/transcriptions',
      action: 'https://bluedot-connect.vercel.app/api/twilio/recording'
    });

    // Generate TwiML XML
    const twimlXml = twiml.toString();
    console.log('📋 Generated TwiML with transcription:', twimlXml);

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
