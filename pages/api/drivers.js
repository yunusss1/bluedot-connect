import { kv } from '@vercel/kv';
import Papa from 'papaparse';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const drivers = await kv.get('drivers') || [];
        res.status(200).json(drivers);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
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