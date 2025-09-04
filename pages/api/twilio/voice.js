// TwiML endpoint for voice calls
const twilio = require('twilio');

export default function handler(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Start real-time transcription (from your doc)
  const start = twiml.start();
  start.transcription({
    statusCallbackUrl: `${process.env.VERCEL_URL || 'https://bluedot-connect.vercel.app'}/api/twilio/transcriptions`,
    languageCode: 'en-US',
    track: 'both_tracks',
    transcriptionEngine: 'google'
  });

  // Get message from query params (campaign template content)
  const message = req.query.message || 'Hello! This is a test call from BlueDot Connect.';
  
  // Speak the message with en-US voice (from your doc)
  twiml.say({ 
    voice: 'Polly.Joanna-Generative', 
    language: 'en-US' 
  }, message);

  // Set response as XML
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml.toString());
}