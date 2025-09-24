// components/CampaignsTab.js
import { useState } from 'react';

export default function CampaignsTab({ drivers, campaigns, setCampaigns, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'voice',
    template_content: '',
    target_driver_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Ready message templates
  const messageTemplates = {
    voice: [
      {
        title: 'Maintenance Reminder',
        content: 'Hello, this is a reminder from EV fleet management. Your vehicle\'s periodic maintenance time is approaching. Please contact the authorized service as soon as possible. Thank you.'
      },
      {
        title: 'Battery Status Check',
        content: 'Hello, we would like to get information about your vehicle\'s battery status. Can you please specify your current charge level and your next charging plan after the beep?'
      },
      {
        title: 'Emergency Notification',
        content: 'Important announcement: Maintenance work will be carried out at charging stations tomorrow between 10:00 and 14:00. We recommend charging your vehicle today.'
      }
    ],
    sms: [
      {
        title: 'Maintenance Reminder',
        content: 'Dear driver, your vehicle\'s maintenance time is approaching. Write 1 for appointment, 2 for cancellation and send.'
      },
      {
        title: 'Charging Reminder',
        content: 'Your vehicle\'s range has dropped below 50km. Nearest charging station: Ataşehir Station Plaza. Write 1 for directions.'
      },
      {
        title: 'Survey',
        content: 'Rate our fleet services between 1-5. 1: Very bad, 5: Excellent. Send your response.'
      }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.name || !formData.template_content || formData.target_driver_ids.length === 0) {
      setAlert({ 
        type: 'error', 
        message: 'Please fill in all fields and select at least one driver.' 
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ 
          type: 'success', 
          message: 'Campaign created successfully! You can start it from the Dashboard.' 
        });
        
        // Reset form
        setFormData({
          name: '',
          type: 'voice',
          template_content: '',
          target_driver_ids: []
        });
        
        // Update campaign list
        onRefresh();
        
        // Remove alert after 5 seconds
        setTimeout(() => setAlert(null), 5000);
      } else {
        const errorData = await response.json();
        setAlert({ 
          type: 'error', 
          message: errorData.error || 'An error occurred while creating the campaign.' 
        });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      setAlert({ 
        type: 'error', 
        message: 'Connection error. Please try again.' 
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleDriver = (driverId) => {
    setFormData(prev => ({
      ...prev,
      target_driver_ids: prev.target_driver_ids.includes(driverId)
        ? prev.target_driver_ids.filter(id => id !== driverId)
        : [...prev.target_driver_ids, driverId]
    }));
  };

  const selectAllDrivers = () => {
    setFormData(prev => ({
      ...prev,
      target_driver_ids: drivers.map(d => d.id)
    }));
  };

  const clearSelection = () => {
    setFormData(prev => ({
      ...prev,
      target_driver_ids: []
    }));
  };

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      template_content: template.content
    }));
    setShowTemplates(false);
  };

  const characterCount = formData.template_content.length;
  const maxCharacters = formData.type === 'sms' ? 160 : 500;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Campaign</h2>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
        >
          <span className="mr-1">📝</span> Ready Templates
        </button>
      </div>
      
      {/* Alert Messages */}
      {alert && (
        <div className={`p-4 rounded-lg mb-4 flex items-center justify-between animate-fade-in ${
          alert.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="mr-2 text-xl">
              {alert.type === 'success' ? '✅' : '❌'}
            </span>
            {alert.message}
          </div>
          <button 
            onClick={() => setAlert(null)}
            className="ml-4 font-bold hover:opacity-70 text-xl"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Template Selector Modal */}
      {showTemplates && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-medium text-purple-900 mb-3">
            {formData.type === 'voice' ? 'Voice Call' : 'SMS'} Templates
          </h3>
          <div className="grid gap-2">
            {messageTemplates[formData.type].map((template, index) => (
              <div 
                key={index}
                className="p-3 bg-white rounded border border-purple-100 hover:border-purple-300 cursor-pointer transition-colors"
                onClick={() => applyTemplate(template)}
              >
                <div className="font-medium text-sm text-purple-700 mb-1">
                  {template.title}
                </div>
                <div className="text-xs text-gray-600">
                  {template.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {drivers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-4xl mb-3">⚠️</div>
          <h3 className="text-yellow-800 font-medium mb-2">
            Driver List Not Found
          </h3>
          <p className="text-yellow-700 text-sm">
            To create a campaign, you first need to upload a CSV file from the Drivers tab.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="e.g. Monthly Maintenance Reminder"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>
          
          {/* Communication Channel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Channel <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border-2 transition-all hover:bg-purple-50 ${formData.type === 'voice' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}">
                <input
                  type="radio"
                  value="voice"
                  checked={formData.type === 'voice'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mr-2 text-purple-600"
                />
                <span className="flex items-center">
                  <span className="mr-2">🎤</span> Voice Call
                </span>
              </label>
              <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border-2 transition-all hover:bg-purple-50 ${formData.type === 'sms' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}">
                <input
                  type="radio"
                  value="sms"
                  checked={formData.type === 'sms'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mr-2 text-purple-600"
                />
                <span className="flex items-center">
                  <span className="mr-2">📱</span> SMS
                </span>
              </label>
            </div>
          </div>
          
          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.template_content}
              onChange={(e) => setFormData({...formData, template_content: e.target.value})}
              rows="5"
              maxLength={maxCharacters}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
              placeholder={formData.type === 'voice' 
                ? "Hello, this is a reminder from EV fleet management. Your vehicle's maintenance time is approaching..." 
                : "Dear driver, your vehicle's maintenance time is approaching. Write 1 for appointment, 2 for cancellation."}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {formData.type === 'voice' 
                  ? 'Text will be automatically converted to speech in voice calls.' 
                  : 'SMS messages are limited to 160 characters.'}
              </p>
              <p className={`text-xs font-medium ${
                characterCount > maxCharacters * 0.9 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {characterCount}/{maxCharacters} characters
              </p>
            </div>
          </div>
          
          {/* Target Drivers */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Target Drivers <span className="text-red-500">*</span>
                <span className="ml-2 text-purple-600">
                  ({formData.target_driver_ids.length}/{drivers.length} selected)
                </span>
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={selectAllDrivers}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  Temizle
                </button>
              </div>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
              {drivers.length > 0 ? (
                drivers.map(driver => (
                  <label 
                    key={driver.id} 
                    className="flex items-center py-2 px-2 hover:bg-white cursor-pointer rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.target_driver_ids.includes(driver.id)}
                      onChange={() => toggleDriver(driver.id)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{driver.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {driver.phone_number}
                      </span>
                      {driver.email && (
                        <span className="ml-2 text-sm text-gray-400">
                          {driver.email}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No drivers added yet
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The campaign will be sent only to selected drivers.
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Create Campaign
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  type: 'voice',
                  template_content: '',
                  target_driver_ids: []
                });
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Temizle
            </button>
          </div>
        </form>
      )}
      
      {/* Campaign Summary */}
      {formData.name && formData.template_content && formData.target_driver_ids.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-medium text-purple-900 mb-2">📋 Campaign Summary</h3>
          <div className="space-y-1 text-sm text-purple-700">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Channel:</strong> {formData.type === 'voice' ? 'Voice Call' : 'SMS'}</p>
            <p><strong>Target Audience:</strong> {formData.target_driver_ids.length} drivers</p>
            <p><strong>Message Length:</strong> {characterCount} characters</p>
          </div>
        </div>
      )}
    </div>
  );
}