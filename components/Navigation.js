export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'drivers', label: 'Drivers', icon: '👥' },
    { id: 'campaigns', label: 'Campaigns', icon: '📢' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md rounded-lg p-2 mb-6 shadow-xl">
      <div className="flex space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium ${
              activeTab === tab.id 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'hover:bg-purple-100 text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}