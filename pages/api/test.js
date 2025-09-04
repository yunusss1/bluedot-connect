export default function handler(req, res) {
  res.status(200).json({ message: 'Test API working!', method: req.method });
}
