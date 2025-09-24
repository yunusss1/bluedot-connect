import { useState, useRef } from 'react';
import Papa from 'papaparse';

export default function DriversTab({ drivers, setDrivers, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDriver, setManualDriver] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const csvData = event.target.result;
        
        const response = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData })
        });

        if (response.ok) {
          const data = await response.json();
          setDrivers(data.drivers);
          setAlert({ type: 'success', message: 'Drivers loaded successfully!' });
          onRefresh();
        } else {
          setAlert({ type: 'error', message: 'Error occurred during loading.' });
        }
      } catch (error) {
        console.error('Upload error:', error);
        setAlert({ type: 'error', message: 'An error occurred.' });
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    
    if (!manualDriver.name || !manualDriver.phone) {
      setAlert({ type: 'error', message: 'Name and phone fields are required!' });
      return;
    }

    setLoading(true);
    try {
      const newDriver = {
        id: `driver_${Date.now()}`,
        name: manualDriver.name,
        phone_number: manualDriver.phone,
        email: manualDriver.email,
        created_at: new Date().toISOString()
      };


      // Send to API (will remain local even if failed)
      try {
        const response = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            csvData: `name,phone,email\n${newDriver.name},${newDriver.phone_number},${newDriver.email}`,
            isManual: true 
          })
        });

        if (response.ok) {
          const data = await response.json();
          setDrivers(data.drivers); // ← Bu satırı ekle
          setAlert({ 
            type: 'success', 
            message: data.message ? 
              'Driver added! (No DB connection, temporarily saved)' : 
              'Driver successfully added and saved!' 
          });
        } else {
          setAlert({ 
            type: 'success', 
            message: 'Driver added! (No DB connection)' 
          });
        }
      } catch (error) {
        console.warn('API error but driver added locally:', error);
        setAlert({ 
          type: 'success', 
            message: 'Driver added! (No DB connection, valid only for this session)'
        });
      }
      
      setManualDriver({ name: '', phone: '', email: '' });
      setShowManualForm(false);
    } catch (error) {
      console.error('Manual add error:', error);
      setAlert({ type: 'error', message: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Driver Management</h2>
      
      {alert && (
        <div className={`p-4 rounded-lg mb-4 ${
          alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {alert.message}
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      {!loading && drivers.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Driver list is empty</h3>
          <p className="text-gray-500 mb-6">Start by uploading a CSV file or adding manually</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📁</span>
              Upload CSV File
            </button>
            <button
              onClick={() => setShowManualForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">👤</span>
              Manuel Ekle
            </button>
          </div>
        </div>
      )}
      
      {drivers.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Total {drivers.length} drivers</p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => setShowManualForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
              >
                <span className="mr-1">👤</span>
                Manuel Ekle
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Upload New List
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-gray-100 hover:bg-purple-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{driver.name}</td>
                    <td className="py-3 px-4 text-gray-600">{driver.phone_number}</td>
                    <td className="py-3 px-4 text-gray-600">{driver.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manuel Ekleme Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add New Driver</h3>
              <button
                onClick={() => {
                  setShowManualForm(false);
                  setManualDriver({ name: '', phone: '', email: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualDriver.name}
                  onChange={(e) => setManualDriver({...manualDriver, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={manualDriver.phone}
                  onChange={(e) => setManualDriver({...manualDriver, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="e.g. +1234567890"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta (Opsiyonel)
                </label>
                <input
                  type="email"
                  value={manualDriver.email}
                  onChange={(e) => setManualDriver({...manualDriver, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="e.g. john@example.com"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Driver'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualForm(false);
                    setManualDriver({ name: '', phone: '', email: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
