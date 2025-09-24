// lib/memory-store.js - TAMAMEN YENİ VERSİYON
// Global in-memory data store with localStorage backup

const memoryStore = {
  drivers: [],
  campaigns: [],
  recordings: [],
  transcripts: []
};

// Browser'da çalışıp çalışmadığını kontrol et
const isBrowser = typeof window !== 'undefined';

// LocalStorage helper functions
const saveToLocalStorage = (key, data) => {
  if (isBrowser) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('LocalStorage save failed:', error);
    }
  }
};

const loadFromLocalStorage = (key) => {
  if (isBrowser) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('LocalStorage load failed:', error);
      return null;
    }
  }
  return null;
};

// Initialize from localStorage if available
if (isBrowser) {
  const savedDrivers = loadFromLocalStorage('drivers');
  const savedCampaigns = loadFromLocalStorage('campaigns');
  
  if (savedDrivers) memoryStore.drivers = savedDrivers;
  if (savedCampaigns) memoryStore.campaigns = savedCampaigns;
}

// Driver operations
export const getDrivers = () => {
  if (memoryStore.drivers.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('drivers');
    if (saved) memoryStore.drivers = saved;
  }
  return memoryStore.drivers;
};

export const setDrivers = (drivers) => { 
  memoryStore.drivers = drivers;
  saveToLocalStorage('drivers', drivers);
};

export const addDrivers = (newDrivers) => { 
  memoryStore.drivers.push(...newDrivers);
  saveToLocalStorage('drivers', memoryStore.drivers);
};

export const addDriver = (driver) => { 
  memoryStore.drivers.push(driver);
  saveToLocalStorage('drivers', memoryStore.drivers);
};

// Campaign operations
export const getCampaigns = () => {
  if (memoryStore.campaigns.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('campaigns');
    if (saved) memoryStore.campaigns = saved;
  }
  return memoryStore.campaigns;
};

export const setCampaigns = (campaigns) => { 
  memoryStore.campaigns = campaigns;
  saveToLocalStorage('campaigns', campaigns);
};

export const addCampaign = (campaign) => { 
  memoryStore.campaigns.push(campaign);
  saveToLocalStorage('campaigns', memoryStore.campaigns);
};

export const getCampaignById = (id) => {
  if (memoryStore.campaigns.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('campaigns');
    if (saved) memoryStore.campaigns = saved;
  }
  return memoryStore.campaigns.find(c => c.id === id);
};

export const updateCampaign = (id, updates) => {
  if (memoryStore.campaigns.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('campaigns');
    if (saved) memoryStore.campaigns = saved;
  }
  
  const index = memoryStore.campaigns.findIndex(c => c.id === id);
  if (index !== -1) {
    memoryStore.campaigns[index] = { ...memoryStore.campaigns[index], ...updates };
    saveToLocalStorage('campaigns', memoryStore.campaigns);
    return memoryStore.campaigns[index];
  }
  return null;
};

// Recording operations
export const getRecordings = () => {
  if (memoryStore.recordings.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('recordings');
    if (saved) memoryStore.recordings = saved;
  }
  return memoryStore.recordings;
};

export const addRecording = (recording) => { 
  memoryStore.recordings.push(recording);
  saveToLocalStorage('recordings', memoryStore.recordings);
};

export const getRecordingByCallSid = (callSid) => {
  if (memoryStore.recordings.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('recordings');
    if (saved) memoryStore.recordings = saved;
  }
  return memoryStore.recordings.find(r => r.callSid === callSid);
};

export const updateRecording = (callSid, updates) => {
  if (memoryStore.recordings.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('recordings');
    if (saved) memoryStore.recordings = saved;
  }
  
  const index = memoryStore.recordings.findIndex(r => r.callSid === callSid);
  if (index !== -1) {
    memoryStore.recordings[index] = { ...memoryStore.recordings[index], ...updates };
    saveToLocalStorage('recordings', memoryStore.recordings);
    return memoryStore.recordings[index];
  }
  return null;
};

// Transcript operations
export const getTranscripts = () => {
  if (memoryStore.transcripts.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('transcripts');
    if (saved) memoryStore.transcripts = saved;
  }
  return memoryStore.transcripts;
};

export const addTranscript = (transcript) => { 
  memoryStore.transcripts.push(transcript);
  saveToLocalStorage('transcripts', memoryStore.transcripts);
};

export const getTranscriptByCallSid = (callSid) => {
  if (memoryStore.transcripts.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('transcripts');
    if (saved) memoryStore.transcripts = saved;
  }
  return memoryStore.transcripts.find(t => t.callSid === callSid);
};

export const updateTranscript = (callSid, updates) => {
  if (memoryStore.transcripts.length === 0 && isBrowser) {
    const saved = loadFromLocalStorage('transcripts');
    if (saved) memoryStore.transcripts = saved;
  }
  
  const index = memoryStore.transcripts.findIndex(t => t.callSid === callSid);
  if (index !== -1) {
    memoryStore.transcripts[index] = { ...memoryStore.transcripts[index], ...updates };
    saveToLocalStorage('transcripts', memoryStore.transcripts);
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
  
  if (isBrowser) {
    localStorage.removeItem('drivers');
    localStorage.removeItem('campaigns');
  }
};

export default memoryStore;
