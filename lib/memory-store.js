// Global in-memory data store
// This replaces KV database for development/demo purposes

const memoryStore = {
  drivers: [],
  campaigns: [],
  recordings: [], // Call recordings
  transcripts: [] // Call transcripts
};

// Driver operations
export const getDrivers = () => memoryStore.drivers;
export const setDrivers = (drivers) => { memoryStore.drivers = drivers; };
export const addDrivers = (newDrivers) => { memoryStore.drivers.push(...newDrivers); };
export const addDriver = (driver) => { memoryStore.drivers.push(driver); };

// Campaign operations
export const getCampaigns = () => memoryStore.campaigns;
export const setCampaigns = (campaigns) => { memoryStore.campaigns = campaigns; };
export const addCampaign = (campaign) => { memoryStore.campaigns.push(campaign); };
export const getCampaignById = (id) => memoryStore.campaigns.find(c => c.id === id);
export const updateCampaign = (id, updates) => {
  const index = memoryStore.campaigns.findIndex(c => c.id === id);
  if (index !== -1) {
    memoryStore.campaigns[index] = { ...memoryStore.campaigns[index], ...updates };
    return memoryStore.campaigns[index];
  }
  return null;
};

// Recording operations
export const getRecordings = () => memoryStore.recordings;
export const addRecording = (recording) => { memoryStore.recordings.push(recording); };
export const getRecordingByCallSid = (callSid) => memoryStore.recordings.find(r => r.callSid === callSid);
export const updateRecording = (callSid, updates) => {
  const index = memoryStore.recordings.findIndex(r => r.callSid === callSid);
  if (index !== -1) {
    memoryStore.recordings[index] = { ...memoryStore.recordings[index], ...updates };
    return memoryStore.recordings[index];
  }
  return null;
};

// Transcript operations
export const getTranscripts = () => memoryStore.transcripts;
export const addTranscript = (transcript) => { memoryStore.transcripts.push(transcript); };
export const getTranscriptByCallSid = (callSid) => memoryStore.transcripts.find(t => t.callSid === callSid);
export const updateTranscript = (callSid, updates) => {
  const index = memoryStore.transcripts.findIndex(t => t.callSid === callSid);
  if (index !== -1) {
    memoryStore.transcripts[index] = { ...memoryStore.transcripts[index], ...updates };
    return memoryStore.transcripts[index];
  }
  return null;
};

// Clear all data (for testing)
export const clearAll = () => {
  memoryStore.drivers = [];
  memoryStore.campaigns = [];
  memoryStore.recordings = [];
  memoryStore.transcripts = [];
};

export default memoryStore;
