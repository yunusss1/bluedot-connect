import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { CallSid, CallStatus } = req.body;
    
    // Update communication log status
    const campaigns = await kv.get('campaigns') || [];
    
    for (let campaign of campaigns) {
      const log = campaign.communication_logs.find(l => l.call_sid === CallSid);
      if (log) {
        log.status = CallStatus;
        log.updated_at = new Date().toISOString();
        
        // Update campaign status if all calls are completed
        const allCompleted = campaign.communication_logs.every(
          l => l.status === 'completed' || l.status === 'failed'
        );
        
        if (allCompleted) {
          campaign.status = 'completed';
          campaign.completed_at = new Date().toISOString();
        }
        
        await kv.set('campaigns', campaigns);
        break;
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
}