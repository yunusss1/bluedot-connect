// pages/api/twilio/recording.js
export default function handler(req, res) {
  console.log('=== RECORDING WEBHOOK ===');
  console.log('Method:', req.method);
  console.log('Recording URL:', req.body.RecordingUrl);
  console.log('Call SID:', req.body.CallSid);
  console.log('Recording Duration:', req.body.RecordingDuration);
  console.log('Recording Status:', req.body.RecordingStatus);
  console.log('Full body:', req.body);

  // Recording verileri
  const recordingData = {
    recordingUrl: req.body.RecordingUrl,
    callSid: req.body.CallSid,
    duration: req.body.RecordingDuration,
    status: req.body.RecordingStatus,
    timestamp: new Date().toISOString()
  };

  // Şimdilik sadece log ediyoruz
  console.log('📁 Recording data to save:', recordingData);

  // TwiML ile devam et
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Joanna-Generative" language="en-US">Thank you for your response. Goodbye.</Say>
    </Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
