// Transcription webhook endpoint (from your doc)
import { addTranscript, getTranscriptByCallSid, updateTranscript } from '../../../lib/memory-store';

export default function handler(req, res) {
  console.log('=== TRANSCRIPTION WEBHOOK ===');
  console.log('Event:', req.body.TranscriptionEvent);
  console.log('Call SID:', req.body.CallSid);
  console.log('Full body:', req.body);

  // Twilio sends different events: started, content, stopped, error
  const { TranscriptionEvent, CallSid, TranscriptionSid, Timestamp, SequenceId, TranscriptionText, Error } = req.body;

  switch (TranscriptionEvent) {
    case 'started':
      console.log('🎙️ Transcription started for call:', CallSid);
      // Yeni transcript başlat
      const newTranscript = {
        callSid: CallSid,
        transcriptionSid: TranscriptionSid,
        status: 'started',
        text: '',
        timestamp: new Date().toISOString(),
        events: []
      };
      addTranscript(newTranscript);
      break;
      
    case 'content':
      console.log('📝 Transcript content:', TranscriptionText);
      // Mevcut transcript'i güncelle
      const existingTranscript = getTranscriptByCallSid(CallSid);
      if (existingTranscript) {
        updateTranscript(CallSid, {
          text: TranscriptionText,
          lastUpdated: new Date().toISOString(),
          events: [...(existingTranscript.events || []), {
            type: 'content',
            text: TranscriptionText,
            timestamp: new Date().toISOString()
          }]
        });
      }
      break;
      
    case 'stopped':
      console.log('⏹️ Transcription stopped for call:', CallSid);
      // Transcript'i tamamlandı olarak işaretle
      const finalTranscript = getTranscriptByCallSid(CallSid);
      if (finalTranscript) {
        updateTranscript(CallSid, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          events: [...(finalTranscript.events || []), {
            type: 'stopped',
            timestamp: new Date().toISOString()
          }]
        });
      }
      break;
      
    case 'error':
      console.log('❌ Transcription error:', Error);
      // Hata durumunu kaydet
      const errorTranscript = getTranscriptByCallSid(CallSid);
      if (errorTranscript) {
        updateTranscript(CallSid, {
          status: 'error',
          error: Error,
          errorAt: new Date().toISOString(),
          events: [...(errorTranscript.events || []), {
            type: 'error',
            error: Error,
            timestamp: new Date().toISOString()
          }]
        });
      }
      break;
      
    default:
      console.log('🤷 Unknown transcription event:', TranscriptionEvent);
  }

  // Always respond with 204 (No Content) to acknowledge receipt
  res.status(204).end();
}
