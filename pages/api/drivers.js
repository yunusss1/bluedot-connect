import Papa from 'papaparse';

// Safe KV import with fallback
let kv = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kv = require('@vercel/kv').kv;
  }
} catch (error) {
  console.warn('Vercel KV not available');
}

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        if (!kv) {
          // Return empty data when KV not available
          return res.status(200).json([]);
        }
        const drivers = await kv.get('drivers') || [];
        res.status(200).json(drivers);
      } catch (error) {
        console.warn('KV error, returning empty data');
        res.status(200).json([]);
      }
      break;

    case 'POST':
      try {
        const { csvData } = req.body;
        
        // Parse CSV data
        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true
        });
        
        // Format driver data
        const drivers = parsed.data.map((row, index) => ({
          id: `driver_${Date.now()}_${index}`,
          name: row.name || row.Name || row.isim || row.İsim,
          phone_number: row.phone || row.Phone || row.telefon || row.Telefon,
          email: row.email || row.Email || row.eposta || row.Eposta,
          created_at: new Date().toISOString()
        }));
        
        // Save to Vercel KV
        await kv.set('drivers', drivers);
        
        res.status(201).json({ success: true, drivers });
      } catch (error) {
        res.status(500).json({ error: 'Failed to upload drivers' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}