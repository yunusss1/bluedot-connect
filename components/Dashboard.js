import { useState } from 'react';

export default function Dashboard({ campaigns, drivers, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [smsLoading, setSmsLoading] = useState(false);

  // İstatistikler hesapla
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ongoing').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
    totalDrivers: drivers.length
  };

  // SMS Test Gönder
  const sendTestSMS = async () => {
    setSmsLoading(true);
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+905551234567', // Test numarası
          message: 'Bu bir test mesajıdır! EV Filo Yönetim Sistemi çalışıyor! 🚗⚡'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAlert({ 
          type: 'success', 
          message: result.simulated 
            ? '📱 SMS simülasyonu başarılı! (Twilio ENV gerekli)' 
            : '📱 SMS başarıyla gönderildi!' 
        });
      } else {
        setAlert({ 
          type: 'error', 
          message: 'SMS gönderilirken hata oluştu' 
        });
      }
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: 'SMS Hatası: ' + error.message 
      });
    } finally {
      setSmsLoading(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Kampanya başlat
  const startCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: 'Kampanya başarıyla başlatıldı!' 
        });
        onRefresh();
      } else {
        const errorData = await response.json();
        setAlert({ 
          type: 'error', 
          message: errorData.error || 'Kampanya başlatılırken hata oluştu.' 
        });
      }
    } catch (error) {
      console.error('Campaign start error:', error);
      setAlert({ 
        type: 'error', 
        message: 'Bağlantı hatası. Lütfen tekrar deneyin.' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Kampanya durdu
  const updateCampaignStatus = async (campaignId, status) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, status })
      });

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: 'Kampanya durumu güncellendi!' 
        });
        onRefresh();
      } else {
        setAlert({ 
          type: 'error', 
          message: 'Durum güncellenirken hata oluştu.' 
        });
      }
    } catch (error) {
      console.error('Status update error:', error);
      setAlert({ 
        type: 'error', 
        message: 'Bağlantı hatası.' 
      });
    } finally {
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Durum badge'i
  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-yellow-100 text-yellow-800', text: 'Planlandı', icon: '⏰' },
      ongoing: { color: 'bg-blue-100 text-blue-800', text: 'Devam Ediyor', icon: '🔄' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Tamamlandı', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Başarısız', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  // İstatistik kartı
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <div className={`p-4 rounded-lg flex items-center justify-between animate-fade-in ${
          alert.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="mr-2 text-xl">
              {alert.type === 'success' ? '✅' : '⚠️'}
            </span>
            {alert.message}
          </div>
          <button 
            onClick={() => setAlert(null)}
            className="ml-4 font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Toplam Kampanya" 
          value={stats.totalCampaigns} 
          icon="📢" 
          color="text-purple-600"
        />
        <StatCard 
          title="Aktif Kampanya" 
          value={stats.activeCampaigns} 
          icon="🔄" 
          color="text-blue-600"
        />
        <StatCard 
          title="Tamamlanan" 
          value={stats.completedCampaigns} 
          icon="✅" 
          color="text-green-600"
        />
        <StatCard 
          title="Planlanan" 
          value={stats.scheduledCampaigns} 
          icon="⏰" 
          color="text-yellow-600"
        />
        <StatCard 
          title="Toplam Sürücü" 
          value={stats.totalDrivers} 
          icon="👥" 
          color="text-gray-600"
        />
      </div>

      {/* SMS Test Kartı */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">📱 SMS Test</h3>
            <p className="text-blue-100">Twilio SMS entegrasyonunu test et</p>
          </div>
          <button
            onClick={sendTestSMS}
            disabled={smsLoading}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 
                       backdrop-blur-md px-6 py-3 rounded-lg font-medium 
                       transition-all duration-200 flex items-center gap-2
                       disabled:cursor-not-allowed"
          >
            {smsLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                Gönderiliyor...
              </>
            ) : (
              <>
                📱 Test SMS Gönder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Kampanya Listesi */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 Kampanya Yönetimi</h2>
          <button
            onClick={onRefresh}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            🔄 Yenile
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz kampanya oluşturulmamış
            </h3>
            <p className="text-gray-500">
              Kampanyalar sekmesinden yeni kampanya oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const targetDrivers = drivers.filter(d => 
                campaign.target_driver_ids?.includes(d.id)
              );
              const totalLogs = campaign.communication_logs?.length || 0;
              const completedLogs = campaign.communication_logs?.filter(
                log => log.status === 'completed'
              ).length || 0;
              const successRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

              return (
                <div 
                  key={campaign.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Kampanya Bilgileri */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Kanal:</span> 
                          <span className="ml-1">
                            {campaign.type === 'voice' ? '🎤 Sesli' : '📱 SMS'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Hedef:</span> 
                          <span className="ml-1">{targetDrivers.length} sürücü</span>
                        </div>
                        <div>
                          <span className="font-medium">İletişim:</span> 
                          <span className="ml-1">{totalLogs} gönderim</span>
                        </div>
                        {totalLogs > 0 && (
                          <div>
                            <span className="font-medium">Başarı:</span> 
                            <span className={`ml-1 font-medium ${
                              successRate >= 80 ? 'text-green-600' : 
                              successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              %{successRate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex gap-2">
                      {campaign.status === 'scheduled' && (
                        <button
                          onClick={() => startCampaign(campaign.id)}
                          disabled={loading || targetDrivers.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Başlatılıyor...
                            </>
                          ) : (
                            <>
                              <span className="mr-1">▶️</span>
                              Başlat
                            </>
                          )}
                        </button>
                      )}
                      
                      {campaign.status === 'ongoing' && (
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <span className="mr-1">⏹️</span>
                          Durdur
                        </button>
                      )}

                      {campaign.status === 'completed' && (
                        <div className="px-4 py-2 text-green-600 font-medium">
                          ✅ Tamamlandı
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mesaj Önizleme */}
                  {campaign.template_content && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">MESAJ ÖNİZLEME:</p>
                      <p className="text-sm text-gray-700 italic">
                        "{campaign.template_content.length > 100 
                          ? campaign.template_content.substring(0, 100) + '...' 
                          : campaign.template_content}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
