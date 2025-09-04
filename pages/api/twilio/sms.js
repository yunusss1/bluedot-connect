import twilio from 'twilio';
import { kv } from '@vercel/kv';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { campaignId, driverId, phoneNumber, message } = req.body;
    
    // Send SMS
    const sms = await client.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.VERCEL_URL}/api/twilio/sms-status`
    });
    
    // Log the communication
    const campaigns = await kv.get('campaigns') || [];
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (campaign) {
      const log = {
        id: `log_${Date.now()}`,
        campaign_id: campaignId,
        driver_id: driverId,
        type: 'sms',
        status: 'sent',
        message_sid: sms.sid,
        message_body: message,
        created_at: new Date().toISOString()
      };
      
      campaign.communication_logs.push(log);
      await kv.set('campaigns', campaigns);
    }
    
    res.status(200).json({ success: true, messageSid: sms.sid });
  } catch (error) {
    console.error('Twilio SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
}
