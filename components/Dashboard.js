import { useState, useEffect } from 'react';

export default function Dashboard({ campaigns, drivers, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [expandedCall, setExpandedCall] = useState(null);

  // Load recordings and transcripts with smart polling
  useEffect(() => {
    const loadCallData = async () => {
      try {
        const [recordingsRes, transcriptsRes] = await Promise.all([
          fetch('/api/recordings'),
          fetch('/api/transcripts')
        ]);
        
        if (recordingsRes.ok) {
          const recordingsData = await recordingsRes.json();
          setRecordings(recordingsData.recordings || []);
        }
        
        if (transcriptsRes.ok) {
          const transcriptsData = await transcriptsRes.json();
          setTranscripts(transcriptsData.transcripts || []);
        }
      } catch (error) {
        console.error('Error loading call data:', error);
      }
    };

    // Initial load
    loadCallData();

    // Check if we need to continue polling
    const shouldPoll = () => {
      // Get all call SIDs from campaigns
      const allCallSids = campaigns
        .filter(c => c.results && c.results.length > 0)
        .flatMap(c => c.results.map(r => r.sid))
        .filter(sid => sid);

      // If no calls, don't poll
      if (allCallSids.length === 0) return false;

      // Check if any calls are missing recording or transcript
      const hasIncompleteData = allCallSids.some(sid => {
        const hasRecording = recordings.some(r => r.callSid === sid);
        const hasTranscript = transcripts.some(t => t.callSid === sid);
        return !hasRecording || !hasTranscript;
      });

      return hasIncompleteData;
    };

    // Smart polling - only poll if there's incomplete data
    const interval = setInterval(() => {
      if (shouldPoll()) {
        loadCallData();
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [campaigns, recordings, transcripts]); // Include recordings and transcripts in dependencies

  // Calculate statistics
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ongoing').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
    totalDrivers: drivers.length
  };

  // Arama sonuçları hesapla - recording ve transcript verilerini de ekle
  const callResults = campaigns
    .filter(c => c.results && c.results.length > 0)
    .flatMap(c => c.results.map(r => {
      const recording = recordings.find(rec => rec.callSid === r.sid);
      const transcript = transcripts.find(trans => trans.callSid === r.sid);
      
      return { 
        ...r, 
        campaignId: c.id, 
        campaignName: c.name,
        recording: recording || null,
        transcript: transcript || null
      };
    }))
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)) // En yeni önce
    .slice(0, 10); // Son 10 arama sonucu

  // SMS Test Gönder
  const sendTestSMS = async () => {
    setSmsLoading(true);
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+15005550006', // Twilio Magic Test Number
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

  // Start campaign
  const startCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/start?id=${campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: 'Campaign started successfully!' 
        });
        onRefresh();
      } else {
        const errorData = await response.json();
        setAlert({ 
          type: 'error', 
          message: errorData.error || 'Error occurred while starting campaign.' 
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

  // Stop campaign
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
          message: 'Campaign status updated!' 
        });
        onRefresh();
      } else {
        setAlert({ 
          type: 'error', 
          message: 'Error occurred while updating status.' 
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

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-yellow-100 text-yellow-800', text: 'Planlandı', icon: '⏰' },
      ongoing: { color: 'bg-blue-100 text-blue-800', text: 'Ongoing', icon: '🔄' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  // Statistics card
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Campaigns" 
          value={stats.totalCampaigns} 
          icon="📢" 
          color="text-purple-600"
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats.activeCampaigns} 
          icon="🔄" 
          color="text-blue-600"
        />
        <StatCard 
          title="Completed" 
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
          title="Total Drivers" 
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

      {/* Campaign List */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 Campaign Management</h2>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              🔄 Campaigns
            </button>
            <button
              onClick={() => {
                // Force refresh call data
                const loadCallData = async () => {
                  try {
                    const [recordingsRes, transcriptsRes] = await Promise.all([
                      fetch('/api/recordings'),
                      fetch('/api/transcripts')
                    ]);
                    
                    if (recordingsRes.ok) {
                      const recordingsData = await recordingsRes.json();
                      setRecordings(recordingsData.recordings || []);
                    }
                    
                    if (transcriptsRes.ok) {
                      const transcriptsData = await transcriptsRes.json();
                      setTranscripts(transcriptsData.transcripts || []);
                    }
                  } catch (error) {
                    console.error('Error loading call data:', error);
                  }
                };
                loadCallData();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              📞 Call Data
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns created yet
            </h3>
            <p className="text-gray-500">
              You can create a new campaign from the Campaigns tab.
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
                    {/* Campaign Information */}
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
                              Starting...
                            </>
                          ) : (
                            <>
                              <span className="mr-1">▶️</span>
                              Start
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
                          Stop
                        </button>
                      )}

                      {campaign.status === 'completed' && (
                        <div className="px-4 py-2 text-green-600 font-medium">
                          ✅ Completed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Preview */}
                  {campaign.template_content && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">MESSAGE PREVIEW:</p>
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

      {/* Call Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            📞 Recent Call Results
          </h2>
          {(() => {
            // Check if we're still polling for incomplete data
            const allCallSids = campaigns
              .filter(c => c.results && c.results.length > 0)
              .flatMap(c => c.results.map(r => r.sid))
              .filter(sid => sid);
            
            if (allCallSids.length === 0) {
              return (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  No calls yet
                </div>
              );
            }

            const hasIncompleteData = allCallSids.some(sid => {
              const hasRecording = recordings.some(r => r.callSid === sid);
              const hasTranscript = transcripts.some(t => t.callSid === sid);
              return !hasRecording || !hasTranscript;
            });

            return hasIncompleteData ? (
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Waiting for data...
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                All data loaded
              </div>
            );
          })()}
        </div>

        {callResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No call results found yet.</p>
            <p className="text-sm mt-2">Results will appear here when you start a campaign.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {callResults.map((result, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`w-3 h-3 rounded-full ${
                        result.success ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="font-medium text-gray-900">{result.driverName}</span>
                      <span className="text-sm text-gray-500">{result.phone}</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>📋 {result.campaignName}</span>
                      {result.sid && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {result.sid.substring(0, 12)}...
                        </span>
                      )}
                      {/* Recording info */}
                      {result.recording && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          🎤 {result.recording.duration}s recorded
                        </span>
                      )}
                      {/* Transcript info */}
                      {result.transcript && result.transcript.status === 'completed' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          📝 Transcript ready
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div className={`text-sm font-medium ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.simulated ? '🔧 Simulated' : result.success ? '✅ Success' : '❌ Failed'}
                    </div>
                    
                    {/* Recording play button */}
                    {result.recording && result.recording.recordingUrl && (
                      <button
                        onClick={() => window.open(result.recording.recordingUrl, '_blank')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        title="Play recording"
                      >
                        <span>🎵</span>
                        <span>Play</span>
                      </button>
                    )}
                    
                    {/* Expand button for details */}
                    {(result.recording || result.transcript) && (
                      <button
                        onClick={() => setExpandedCall(expandedCall === result.sid ? null : result.sid)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center space-x-1"
                        title="View details"
                      >
                        <span>{expandedCall === result.sid ? '📖' : '👁️'}</span>
                        <span>{expandedCall === result.sid ? 'Hide' : 'Details'}</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedCall === result.sid && (result.recording || result.transcript) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Recording details */}
                    {result.recording && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          🎤 Recording Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-700">Duration:</span>
                            <span className="ml-2 text-blue-600">{result.recording.duration}s</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Status:</span>
                            <span className="ml-2 text-blue-600">{result.recording.status}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-blue-700">Recorded:</span>
                            <span className="ml-2 text-blue-600">
                              {new Date(result.recording.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {result.recording.recordingUrl && (
                          <div className="mt-3">
                            <audio controls className="w-full">
                              <source src={result.recording.recordingUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Transcript details */}
                    {result.transcript && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2 flex items-center">
                          📝 Transcript
                        </h4>
                        <div className="mb-3">
                          <span className="font-medium text-green-700">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            result.transcript.status === 'completed' 
                              ? 'bg-green-200 text-green-800' 
                              : result.transcript.status === 'error'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {result.transcript.status}
                          </span>
                        </div>
                        
                        {result.transcript.text && (
                          <div className="bg-white rounded border p-3">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              "{result.transcript.text}"
                            </p>
                          </div>
                        )}
                        
                        {result.transcript.status === 'error' && result.transcript.error && (
                          <div className="bg-red-100 rounded border border-red-200 p-3 mt-2">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Error:</span> {result.transcript.error}
                            </p>
                          </div>
                        )}
                        
                        {result.transcript.completedAt && (
                          <div className="mt-2 text-xs text-green-600">
                            Completed: {new Date(result.transcript.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
