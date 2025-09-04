import { useState, useRef } from 'react';
import Papa from 'papaparse';

export default function DriversTab({ drivers, setDrivers, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);

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
          setAlert({ type: 'success', message: 'Sürücüler başarıyla yüklendi!' });
          onRefresh();
        } else {
          setAlert({ type: 'error', message: 'Yükleme sırasında hata oluştu.' });
        }
      } catch (error) {
        console.error('Upload error:', error);
        setAlert({ type: 'error', message: 'Bir hata oluştu.' });
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sürücü Yönetimi</h2>
      
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sürücü listesi boş</h3>
          <p className="text-gray-500 mb-6">CSV dosyası yükleyerek başlayın</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            CSV Dosyası Yükle
          </button>
        </div>
      )}
      
      {drivers.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Toplam {drivers.length} sürücü</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Yeni Liste Yükle
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">İsim</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">E-posta</th>
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
    </div>
  );
}