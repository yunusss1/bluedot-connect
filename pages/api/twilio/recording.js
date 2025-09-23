// pages/api/twilio/recording.js
export default function handler(req, res) {
  console.log('=== RECORDING WEBHOOK ===');
  console.log('Recording URL:', req.body.RecordingUrl);
  console.log('Call SID:', req.body.CallSid);
  console.log('Recording Duration:', req.body.RecordingDuration);

  // Şimdilik sadece log et - memory store kısmını sonra ekleriz
  const recordingData = {
    recordingUrl: req.body.RecordingUrl,
    callSid: req.body.CallSid,
    duration: req.body.RecordingDuration,
    timestamp: new Date().toISOString()
  };

  console.log('Recording data received:', recordingData);

  // TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Joanna-Generative" language="en-US">Thank you for your response. Goodbye.</Say>
    </Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
