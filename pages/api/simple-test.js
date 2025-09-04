// En basit test - hiçbir import, hiçbir karmaşıklık

export default function handler(req, res) {
  console.log('=== SIMPLE TEST API CALLED ===');
  console.log('Method:', req.method);
  console.log('Time:', new Date().toISOString());
  
  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'POST request received successfully!',
      timestamp: new Date().toISOString(),
      data: req.body || 'No body'
    });
  }
  
  return res.status(200).json({
    success: true,
    message: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
