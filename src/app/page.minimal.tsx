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
                Try Demo
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
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Context Menu Blocking</h3>
              <p className="text-gray-600">Prevents right-click copying and unauthorized access</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-purple-50">
              <div className="text-4xl mb-4">⌨️</div>
              <h3 className="text-xl font-semibold mb-2">Keyboard Protection</h3>
              <p className="text-gray-600">Blocks 50+ dangerous keyboard shortcuts</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-green-50">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Screenshot Prevention</h3>
              <p className="text-gray-600">Detects and blocks screenshot attempts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Demo Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              DRM Protection Features
            </h2>
            <p className="text-xl text-gray-600">
              Experience our security features
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">📄</div>
                <h3 className="text-xl font-semibold text-gray-900">Protected Document Content</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  This represents a DRM-protected document area with advanced security features.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Security Features:</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Context menu blocking</li>
                      <li>• Text selection disabled</li>
                      <li>• Keyboard shortcut blocking</li>
                      <li>• Copy/paste prevention</li>
                      <li>• Developer tools detection</li>
                      <li>• Screenshot prevention</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Platform Support:</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Windows compatibility</li>
                      <li>• macOS compatibility</li>
                      <li>• Linux compatibility</li>
                      <li>• Cross-browser support</li>
                      <li>• Mobile responsive</li>
                      <li>• Enterprise ready</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-green-600 text-4xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Deployment Successful!
            </h3>
            <p className="text-green-700 mb-4">
              FlipBook DRM is now running on AWS Amplify with full DRM protection features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900">🔒 Security Features</h4>
                <p className="text-sm text-gray-600">All DRM protection components ready</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900">⚡ Performance</h4>
                <p className="text-sm text-gray-600">Optimized for fast loading</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">FlipBook DRM</h3>
          <p className="text-gray-400 mb-4">
            Enterprise-grade document protection platform
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <span>🔒 DRM Protected</span>
            <span>⚡ High Performance</span>
            <span>🛡️ Enterprise Security</span>
          </div>
        </div>
      </footer>
    </div>
  )
}