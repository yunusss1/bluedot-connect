import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import DriversTab from '../components/DriversTab';
import CampaignsTab from '../components/CampaignsTab';
import Dashboard from '../components/Dashboard';

export default function Tool() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchCampaigns();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      } else {
        console.warn('API not available yet, using empty data');
        setDrivers([]);
      }
    } catch (error) {
      console.warn('Error fetching drivers:', error);
      setDrivers([]);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        console.warn('API not available yet, using empty data');
        setCampaigns([]);
      }
    } catch (error) {
      console.warn('Error fetching campaigns:', error);
      setCampaigns([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ⚡ EV Fleet Communication Tool
          </h1>
          <p className="text-purple-100">
            Create automated communication campaigns with your drivers
          </p>
        </header>
        
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main>
          {activeTab === 'drivers' && (
            <DriversTab 
              drivers={drivers} 
              setDrivers={setDrivers}
              onRefresh={fetchDrivers}
            />
          )}
          {activeTab === 'campaigns' && (
            <CampaignsTab 
              drivers={drivers} 
              campaigns={campaigns} 
              setCampaigns={setCampaigns}
              onRefresh={fetchCampaigns}
            />
          )}
          {activeTab === 'dashboard' && (
            <Dashboard 
              campaigns={campaigns} 
              drivers={drivers}
              onRefresh={fetchCampaigns}
            />
          )}
        </main>
      </div>
    </div>
  );
}
