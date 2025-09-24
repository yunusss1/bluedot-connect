// API endpoint for transcripts
import { getTranscripts, getTranscriptByCallSid } from '../../lib/memory-store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { callSid } = req.query;
    
    if (callSid) {
      // Specific transcript by call SID
      const transcript = getTranscriptByCallSid(callSid);
      if (transcript) {
        res.status(200).json({ success: true, transcript });
      } else {
        res.status(404).json({ success: false, error: 'Transcript not found' });
      }
    } else {
      // All transcripts
      const transcripts = getTranscripts();
      res.status(200).json({ success: true, transcripts });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
