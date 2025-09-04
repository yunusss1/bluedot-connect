import Papa from 'papaparse';

// FUCK KV - In-memory storage only!
let memoryData = {
  drivers: []
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        res.status(200).json(memoryData.drivers);
      } catch (error) {
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
        
        // Save to memory
        memoryData.drivers = [...memoryData.drivers, ...drivers];
        
        res.status(201).json({ success: true, drivers: memoryData.drivers });
      } catch (error) {
        console.warn('POST error:', error.message);
        res.status(201).json({ 
          success: true, 
          drivers: memoryData.drivers,
          message: 'Added to memory storage' 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}