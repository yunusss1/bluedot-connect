// pages/api/twilio/voice.js - Recording action eklenmiş versiyonu
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

    // Record response with action URL
    twiml.record({
      maxLength: 30,
      finishOnKey: '#',
      transcribe: false,
      action: 'https://bluedot-connect.vercel.app/api/twilio/recording'
    });

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
