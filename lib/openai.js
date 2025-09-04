const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function processTranscription(text) {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Sen bir filo yönetim asistanısın. Sürücülerden gelen sesli yanıtları analiz edip özetliyorsun. 
            Yanıtı şu kategorilere göre sınıflandır:
            - ONAY: Sürücü talebi onaylıyor
            - RED: Sürücü talebi reddediyor
            - BİLGİ: Sürücü bilgi veriyor
            - SORU: Sürücü soru soruyor
            - DİĞER: Diğer durumlar
            
            Yanıtını JSON formatında ver: {"category": "...", "summary": "...", "action_required": true/false}`
          },
          {
            role: 'user',
            content: `Şu yanıtı analiz et: "${text}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        category: 'DİĞER',
        summary: content || text,
        action_required: false
      };
    }
  } catch (error) {
    console.error('OpenAI processing error:', error);
    return {
      category: 'HATA',
      summary: text,
      action_required: true,
      error: error.message
    };
  }
}

export async function generateCampaignContent(type, purpose, tone = 'professional') {
  try {
    const toneMap = {
      professional: 'profesyonel ve resmi',
      friendly: 'samimi ve arkadaşça',
      urgent: 'acil ve önemli'
    };
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `EV filo yönetimi için ${type === 'voice' ? 'sesli arama' : 'SMS'} mesajı oluştur. 
            Ton: ${toneMap[tone]}. 
            ${type === 'sms' ? 'Maksimum 160 karakter.' : 'Maksimum 300 karakter.'}`
          },
          {
            role: 'user',
            content: `Amaç: ${purpose}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Content generation error:', error);
    return '';
  }
}

export async function analyzeCampaignPerformance(campaignData) {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Kampanya performansını analiz et ve öneriler sun. Kısa ve öz ol.'
          },
          {
            role: 'user',
            content: `Kampanya: ${JSON.stringify(campaignData)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.5
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'Analiz yapılamadı.';
  } catch (error) {
    console.error('Performance analysis error:', error);
    return 'Performans analizi sırasında hata oluştu.';
  }
}

export default {
  processTranscription,
  generateCampaignContent,
  analyzeCampaignPerformance
};