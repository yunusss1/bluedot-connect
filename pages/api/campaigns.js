import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const campaigns = await kv.get('campaigns') || [];
        res.status(200).json(campaigns);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaigns' });
      }
      break;

    case 'POST':
      try {
        const { name, type, template_content, target_driver_ids } = req.body;
        
        // Validate input
        if (!name || !type || !template_content || !target_driver_ids?.length) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create campaign object
        const campaign = {
          id: `campaign_${Date.now()}`,
          name,
          type,
          template_content,
          target_driver_ids,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          scheduled_time: new Date().toISOString(),
          communication_logs: []
        };
        
        // Get existing campaigns
        const campaigns = await kv.get('campaigns') || [];
        campaigns.push(campaign);
        
        // Save to KV
        await kv.set('campaigns', campaigns);
        
        res.status(201).json({ success: true, campaign });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create campaign' });
      }
      break;

    case 'PUT':
      try {
        const { id, status } = req.body;
        
        const campaigns = await kv.get('campaigns') || [];
        const campaignIndex = campaigns.findIndex(c => c.id === id);
        
        if (campaignIndex === -1) {
          return res.status(404).json({ error: 'Campaign not found' });
        }
        
        campaigns[campaignIndex].status = status;
        campaigns[campaignIndex].updated_at = new Date().toISOString();
        
        await kv.set('campaigns', campaigns);
        
        res.status(200).json({ success: true, campaign: campaigns[campaignIndex] });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update campaign' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
