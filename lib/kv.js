import { kv } from '@vercel/kv';

// Driver operations
export const driverOperations = {
  async getAll() {
    try {
      const drivers = await kv.get('drivers');
      return drivers || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  },

  async save(drivers) {
    try {
      await kv.set('drivers', drivers);
      return true;
    } catch (error) {
      console.error('Error saving drivers:', error);
      return false;
    }
  },

  async getById(id) {
    try {
      const drivers = await this.getAll();
      return drivers.find(d => d.id === id);
    } catch (error) {
      console.error('Error fetching driver:', error);
      return null;
    }
  },

  async update(id, updates) {
    try {
      const drivers = await this.getAll();
      const index = drivers.findIndex(d => d.id === id);
      
      if (index === -1) return false;
      
      drivers[index] = { ...drivers[index], ...updates };
      await this.save(drivers);
      return true;
    } catch (error) {
      console.error('Error updating driver:', error);
      return false;
    }
  },

  async delete(id) {
    try {
      const drivers = await this.getAll();
      const filtered = drivers.filter(d => d.id !== id);
      await this.save(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return false;
    }
  }
};

// Campaign operations
export const campaignOperations = {
  async getAll() {
    try {
      const campaigns = await kv.get('campaigns');
      return campaigns || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  },

  async save(campaigns) {
    try {
      await kv.set('campaigns', campaigns);
      return true;
    } catch (error) {
      console.error('Error saving campaigns:', error);
      return false;
    }
  },

  async getById(id) {
    try {
      const campaigns = await this.getAll();
      return campaigns.find(c => c.id === id);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  },

  async create(campaignData) {
    try {
      const campaigns = await this.getAll();
      const newCampaign = {
        ...campaignData,
        id: `campaign_${Date.now()}`,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        communication_logs: []
      };
      
      campaigns.push(newCampaign);
      await this.save(campaigns);
      return newCampaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  },

  async update(id, updates) {
    try {
      const campaigns = await this.getAll();
      const index = campaigns.findIndex(c => c.id === id);
      
      if (index === -1) return false;
      
      campaigns[index] = { 
        ...campaigns[index], 
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await this.save(campaigns);
      return campaigns[index];
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    }
  },

  async addLog(campaignId, logData) {
    try {
      const campaigns = await this.getAll();
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (!campaign) return false;
      
      const newLog = {
        ...logData,
        id: `log_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      campaign.communication_logs.push(newLog);
      await this.save(campaigns);
      return newLog;
    } catch (error) {
      console.error('Error adding log:', error);
      return null;
    }
  },

  async updateLog(campaignId, logId, updates) {
    try {
      const campaigns = await this.getAll();
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (!campaign) return false;
      
      const logIndex = campaign.communication_logs.findIndex(l => l.id === logId);
      if (logIndex === -1) return false;
      
      campaign.communication_logs[logIndex] = {
        ...campaign.communication_logs[logIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await this.save(campaigns);
      return true;
    } catch (error) {
      console.error('Error updating log:', error);
      return false;
    }
  }
};

// Analytics operations
export const analyticsOperations = {
  async getCampaignStats(campaignId) {
    try {
      const campaign = await campaignOperations.getById(campaignId);
      if (!campaign) return null;
      
      const logs = campaign.communication_logs || [];
      
      const stats = {
        total: logs.length,
        completed: logs.filter(l => l.status === 'completed').length,
        failed: logs.filter(l => l.status === 'failed').length,
        pending: logs.filter(l => l.status === 'pending' || l.status === 'initiated').length,
        responded: logs.filter(l => l.response_data).length,
        successRate: 0,
        responseRate: 0
      };
      
      if (stats.total > 0) {
        stats.successRate = ((stats.completed / stats.total) * 100).toFixed(2);
        stats.responseRate = ((stats.responded / stats.total) * 100).toFixed(2);
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      return null;
    }
  },

  async getOverallStats() {
    try {
      const campaigns = await campaignOperations.getAll();
      const drivers = await driverOperations.getAll();
      
      const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ongoing').length,
        completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
        scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
        totalDrivers: drivers.length,
        totalCommunications: 0,
        successfulCommunications: 0
      };
      
      campaigns.forEach(campaign => {
        const logs = campaign.communication_logs || [];
        stats.totalCommunications += logs.length;
        stats.successfulCommunications += logs.filter(l => l.status === 'completed').length;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting overall stats:', error);
      return null;
    }
  }
};

// Export all operations
export default {
  drivers: driverOperations,
  campaigns: campaignOperations,
  analytics: analyticsOperations
};