// Health check endpoint to verify all services are configured
export default function handler(req, res) {
  const health = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {}
  };

  // Check Vercel KV
  health.services.vercel_kv = {
    configured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    status: (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ? 'ready' : 'missing_env'
  };

  // Check Twilio
  health.services.twilio = {
    configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    status: (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) ? 'ready' : 'missing_env'
  };

  // Check OpenAI
  health.services.openai = {
    configured: !!process.env.OPENAI_API_KEY,
    status: process.env.OPENAI_API_KEY ? 'ready' : 'missing_env'
  };

  // Overall status
  const allReady = Object.values(health.services).every(service => service.status === 'ready');
  health.overall_status = allReady ? 'all_services_ready' : 'some_services_missing';
  
  // Missing services
  health.missing_services = Object.entries(health.services)
    .filter(([name, service]) => service.status !== 'ready')
    .map(([name, service]) => name);

  res.status(200).json(health);
}
