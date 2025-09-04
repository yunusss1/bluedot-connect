// Transcription webhook endpoint (from your doc)
export default function handler(req, res) {
  console.log('=== TRANSCRIPTION WEBHOOK ===');
  console.log('Event:', req.body.TranscriptionEvent);
  console.log('Call SID:', req.body.CallSid);
  console.log('Full body:', req.body);

  // Twilio sends different events: started, content, stopped, error
  const { TranscriptionEvent, CallSid, TranscriptionSid, Timestamp, SequenceId } = req.body;

  switch (TranscriptionEvent) {
    case 'started':
      console.log('🎙️ Transcription started for call:', CallSid);
      break;
    case 'content':
      console.log('📝 Transcript content:', req.body.TranscriptionText);
      // Here you can save the transcript to your database or process it
      break;
    case 'stopped':
      console.log('⏹️ Transcription stopped for call:', CallSid);
      break;
    case 'error':
      console.log('❌ Transcription error:', req.body.Error);
      break;
    default:
      console.log('🤷 Unknown transcription event:', TranscriptionEvent);
  }

  // Always respond with 204 (No Content) to acknowledge receipt
  res.status(204).end();
}
