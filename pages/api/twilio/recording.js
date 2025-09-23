// pages/api/twilio/recording.js
import { getCampaigns, updateCampaign } from '../../lib/memory-store.js';

export default function handler(req, res) {
  console.log('=== RECORDING WEBHOOK ===');
  console.log('Recording URL:', req.body.RecordingUrl);
  console.log('Call SID:', req.body.CallSid);
  console.log('Recording Duration:', req.body.RecordingDuration);

  // Call SID ile campaign ve result bul
  const campaigns = getCampaigns();
  const callSid = req.body.CallSid;
  
  for (const campaign of campaigns) {
    if (campaign.results) {
      const result = campaign.results.find(r => r.sid === callSid);
      if (result) {
        // Recording URL'sini result'a ekle
        result.recordingUrl = req.body.RecordingUrl;
        result.recordingDuration = req.body.RecordingDuration;
        
        // Campaign'i güncelle
        updateCampaign(campaign.id, { results: campaign.results });
        
        console.log('✅ Recording URL added to campaign result');
        break;
      }
    }
  }

  // TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Joanna-Generative" language="en-US">Thank you for your response. Goodbye.</Say>
    </Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
