// Global in-memory data store
// This replaces KV database for development/demo purposes

const memoryStore = {
  drivers: [],
  campaigns: []
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

// Clear all data (for testing)
export const clearAll = () => {
  memoryStore.drivers = [];
  memoryStore.campaigns = [];
};

export default memoryStore;
