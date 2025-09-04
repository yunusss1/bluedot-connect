import { getCampaigns, addCampaign, updateCampaign, getCampaignById } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        res.status(200).json(getCampaigns());
      } catch (error) {
        res.status(200).json([]);
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
        
        // Save to memory store
        addCampaign(campaign);
        
        res.status(201).json({ success: true, campaign });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create campaign' });
      }
      break;

    case 'PUT':
      try {
        const { id, status } = req.body;
        
        const campaign = getCampaignById(id);
        
        if (!campaign) {
          return res.status(404).json({ error: 'Campaign not found' });
        }
        
        const updatedCampaign = updateCampaign(id, { 
          status, 
          updated_at: new Date().toISOString() 
        });
        
        res.status(200).json({ success: true, campaign: updatedCampaign });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update campaign' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}