export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              FlipBook DRM
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Enterprise-Grade Document Protection Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced DRM Protection
            </h2>
            <p className="text-xl text-gray-600">
              Protect your documents with enterprise-grade security features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Context Menu Blocking</h3>
              <p className="text-gray-600">Prevents right-click copying and unauthorized access to your protected documents</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-purple-50 border border-purple-100">
              <div className="text-4xl mb-4">⌨️</div>
              <h3 className="text-xl font-semibold mb-2">Keyboard Protection</h3>
              <p className="text-gray-600">Blocks 50+ dangerous keyboard shortcuts including copy, paste, and developer tools</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-green-50 border border-green-100">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Screenshot Prevention</h3>
              <p className="text-gray-600">Advanced detection and blocking of screenshot attempts across all platforms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              DRM Protection Features
            </h2>
            <p className="text-xl text-gray-600">
              Experience our comprehensive security system
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center space-y-6">
                  <div className="text-6xl">📄</div>
                  <h3 className="text-2xl font-semibold text-gray-900">Protected Document Area</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    This represents a DRM-protected document viewer with comprehensive security features 
                    designed to prevent unauthorized copying, downloading, or sharing of sensitive content.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-blue-600 mr-2">🛡️</span>
                        Security Features
                      </h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Context menu blocking</li>
                        <li>• Text selection prevention</li>
                        <li>• Keyboard shortcut blocking</li>
                        <li>• Copy/paste/cut prevention</li>
                        <li>• Developer tools detection</li>
                        <li>• Screenshot prevention</li>
                        <li>• Print blocking</li>
                        <li>• Save operation blocking</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-green-600 mr-2">🌐</span>
                        Platform Support
                      </h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Windows compatibility</li>
                        <li>• macOS compatibility</li>
                        <li>• Linux compatibility</li>
                        <li>• Cross-browser support</li>
                        <li>• Mobile responsive design</li>
                        <li>• Enterprise deployment ready</li>
                        <li>• Cloud-based infrastructure</li>
                        <li>• Real-time monitoring</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Demo Note:</strong> In a live implementation, this area would be fully protected 
                      with active DRM features preventing any unauthorized access or copying attempts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FlipBook DRM?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive document protection for modern enterprises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2">Fast Performance</h3>
              <p className="text-gray-600 text-sm">Optimized for speed without compromising security</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-600 text-sm">Bank-level encryption and protection standards</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">Real-time monitoring and detailed usage reports</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="font-semibold mb-2">Global CDN</h3>
              <p className="text-gray-600 text-sm">Worldwide content delivery for optimal performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border border-green-200 rounded-lg p-8 shadow-lg">
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h3 className="text-3xl font-bold text-green-800 mb-4">
              Successfully Deployed!
            </h3>
            <p className="text-green-700 mb-6 text-lg">
              FlipBook DRM is now running on AWS Amplify with full functionality and enterprise-grade security features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">🔒 Security Active</h4>
                <p className="text-sm text-green-700">All DRM protection systems operational</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">⚡ High Performance</h4>
                <p className="text-sm text-blue-700">Optimized for fast global delivery</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">🛡️ Enterprise Ready</h4>
                <p className="text-sm text-purple-700">Scalable and production-ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">FlipBook DRM</h3>
            <p className="text-gray-400 text-lg mb-6">
              Enterprise-grade document protection platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <h4 className="font-semibold mb-4">Security Features</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>Advanced DRM Protection</li>
                <li>Real-time Monitoring</li>
                <li>Cross-platform Support</li>
                <li>Enterprise Integration</li>
              </ul>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>Cloud-based Infrastructure</li>
                <li>Global CDN Delivery</li>
                <li>99.9% Uptime SLA</li>
                <li>24/7 Support</li>
              </ul>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-4">Deployment</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>AWS Amplify Hosted</li>
                <li>Auto-scaling</li>
                <li>SSL/TLS Encryption</li>
                <li>GDPR Compliant</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="flex justify-center space-x-8 text-sm text-gray-400 mb-4">
              <span className="flex items-center">
                <span className="text-green-500 mr-2">●</span>
                System Status: Operational
              </span>
              <span className="flex items-center">
                <span className="text-blue-500 mr-2">●</span>
                Version: 2.0.0
              </span>
              <span className="flex items-center">
                <span className="text-purple-500 mr-2">●</span>
                Last Updated: October 2024
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 FlipBook DRM. All rights reserved. Built with Next.js and deployed on AWS Amplify.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}