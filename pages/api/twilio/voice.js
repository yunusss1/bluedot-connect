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
    
    // Create TwiML for the call
    const twiml = `
      <Response>
        <Say language="tr-TR" voice="alice">
          ${message}
        </Say>
        <Pause length="2"/>
        <Say language="tr-TR" voice="alice">
          Mesajınızı kaydetmek için bip sesinden sonra konuşun.
        </Say>
        <Record 
          maxLength="30"
          transcribe="true"
          transcribeCallback="${process.env.VERCEL_URL}/api/twilio/transcription"
          action="${process.env.VERCEL_URL}/api/twilio/recording-complete"
        />
      </Response>
    `;
    
    // Make the call
    const call = await client.calls.create({
      twiml,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.VERCEL_URL}/api/twilio/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });
    
    // Log the communication
    const campaigns = await kv.get('campaigns') || [];
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (campaign) {
      const log = {
        id: `log_${Date.now()}`,
        campaign_id: campaignId,
        driver_id: driverId,
        type: 'voice',
        status: 'initiated',
        call_sid: call.sid,
        created_at: new Date().toISOString()
      };
      
      campaign.communication_logs.push(log);
      await kv.set('campaigns', campaigns);
    }
    
    res.status(200).json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Twilio voice error:', error);
    res.status(500).json({ error: 'Failed to make call' });
  }
}
