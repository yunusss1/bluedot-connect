// API endpoint for recordings
import { getRecordings, getRecordingByCallSid } from '../../lib/memory-store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { callSid } = req.query;
    
    if (callSid) {
      // Specific recording by call SID
      const recording = getRecordingByCallSid(callSid);
      if (recording) {
        res.status(200).json({ success: true, recording });
      } else {
        res.status(404).json({ success: false, error: 'Recording not found' });
      }
    } else {
      // All recordings
      const recordings = getRecordings();
      res.status(200).json({ success: true, recordings });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
