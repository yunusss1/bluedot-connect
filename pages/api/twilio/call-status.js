// Call status webhook endpoint (from your doc)
export default function handler(req, res) {
  console.log('=== CALL STATUS WEBHOOK ===');
  console.log('Call Status:', req.body.CallStatus);
  console.log('Call SID:', req.body.CallSid);
  console.log('Full body:', req.body);

  const { CallStatus, CallSid, From, To, CallDuration, Direction } = req.body;

  switch (CallStatus) {
    case 'initiated':
      console.log('📞 Call initiated:', CallSid);
      break;
    case 'ringing':
      console.log('📳 Call ringing:', CallSid);
      break;
    case 'answered':
      console.log('✅ Call answered:', CallSid);
      break;
    case 'completed':
      console.log('📞 Call completed:', CallSid, `Duration: ${CallDuration}s`);
      break;
    case 'busy':
      console.log('📵 Call busy:', CallSid);
      break;
    case 'no-answer':
      console.log('📵 Call no-answer:', CallSid);
      break;
    case 'failed':
      console.log('❌ Call failed:', CallSid);
      break;
    default:
      console.log('🤷 Unknown call status:', CallStatus);
  }

  // Always respond with 204 (No Content) to acknowledge receipt
  res.status(204).end();
}
