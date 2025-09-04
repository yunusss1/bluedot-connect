import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import DriversTab from '../components/DriversTab';
import CampaignsTab from '../components/CampaignsTab';
import Dashboard from '../components/Dashboard';

export default function Home() {
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
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ⚡ EV Filo İletişim Aracı
          </h1>
          <p className="text-purple-100">
            Sürücülerinizle otomatik iletişim kampanyaları oluşturun
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