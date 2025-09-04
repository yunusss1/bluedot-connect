import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { CallSid, TranscriptionText, TranscriptionStatus } = req.body;
    
    // Find and update the communication log
    const campaigns = await kv.get('campaigns') || [];
    
    for (let campaign of campaigns) {
      const log = campaign.communication_logs.find(l => l.call_sid === CallSid);
      if (log) {
        log.transcription = TranscriptionText;
        log.transcription_status = TranscriptionStatus;
        log.response_data = TranscriptionText;
        log.updated_at = new Date().toISOString();
        
        // Use OpenAI to process the transcription if needed
        if (TranscriptionText) {
          const processedResponse = await processTranscriptionWithAI(TranscriptionText);
          log.processed_response = processedResponse;
        }
        
        await kv.set('campaigns', campaigns);
        break;
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to process transcription' });
  }
}

// Helper function to process transcription with OpenAI
async function processTranscriptionWithAI(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sen bir filo yönetim asistanısın. Sürücülerden gelen sesli yanıtları analiz edip özetliyorsun.'
          },
          {
            role: 'user',
            content: `Şu yanıtı analiz et ve kısa bir özet çıkar: "${text}"`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('OpenAI error:', error);
    return text;
  }
}