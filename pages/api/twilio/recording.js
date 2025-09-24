// pages/api/twilio/recording.js
import { addRecording, getRecordingByCallSid, updateRecording } from '../../../lib/memory-store';

export default function handler(req, res) {
  console.log('=== RECORDING WEBHOOK ===');
  console.log('Recording URL:', req.body.RecordingUrl);
  console.log('Call SID:', req.body.CallSid);
  console.log('Recording Duration:', req.body.RecordingDuration);

  const { RecordingUrl, CallSid, RecordingDuration, RecordingStatus } = req.body;

  // Recording verilerini hazırla
  const recordingData = {
    recordingUrl: RecordingUrl,
    callSid: CallSid,
    duration: parseInt(RecordingDuration) || 0,
    status: RecordingStatus || 'completed',
    timestamp: new Date().toISOString()
  };

  console.log('Recording data received:', recordingData);

  // Mevcut recording var mı kontrol et
  const existingRecording = getRecordingByCallSid(CallSid);
  
  if (existingRecording) {
    // Mevcut recording'ı güncelle
    updateRecording(CallSid, recordingData);
    console.log('Updated existing recording for call:', CallSid);
  } else {
    // Yeni recording ekle
    addRecording(recordingData);
    console.log('Added new recording for call:', CallSid);
  }

  // TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Joanna-Generative" language="en-US">Thank you for your response. Goodbye.</Say>
    </Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
