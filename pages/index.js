import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/tool');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">Bluedot</span>
            </div>
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Voice AI that makes every driver feel like a VIP
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Bluedot Connect automates your EV fleet communication with AI-powered voice calls and SMS campaigns. 
            Reach your drivers instantly, anywhere, anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start Free Trial'}
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Own your AI, don't rent it
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built from the ground up for EV fleet management. No OpenAI, no data sharing, just your fleet, your data, your control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Voice & SMS Campaigns</h3>
              <p className="text-gray-300">
                Send automated voice calls and SMS messages to your entire fleet. 
                AI-powered responses and real-time analytics.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Responses</h3>
              <p className="text-gray-300">
                Intelligent conversation handling with sentiment analysis, 
                call scoring, and automated follow-ups.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Analytics</h3>
              <p className="text-gray-300">
                Track campaign performance, driver engagement, and communication 
                success rates with detailed insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              From maintenance reminders to emergency alerts
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Support your drivers anywhere and everywhere with automated communication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Maintenance Reminders</h3>
              <p className="text-gray-400 text-sm">Automated service scheduling and reminders</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Charging Alerts</h3>
              <p className="text-gray-400 text-sm">Low battery notifications and station directions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Emergency Notifications</h3>
              <p className="text-gray-400 text-sm">Critical alerts and safety communications</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Driver Surveys</h3>
              <p className="text-gray-400 text-sm">Feedback collection and satisfaction tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your fleet communication?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join leading EV fleets using Bluedot Connect to automate their driver communication.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Start Your Free Trial'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-gray-400">© 2024 Bluedot. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}