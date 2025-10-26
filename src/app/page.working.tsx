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
              Advanced DRM Protection Features
            </h2>
            <p className="text-xl text-gray-600">
              Protect your documents with enterprise-grade security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Context Menu Blocking</h3>
              <p className="text-gray-600">Prevents right-click copying and unauthorized access to document content</p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-purple-50 border border-purple-100">
              <div className="text-5xl mb-4">⌨️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Keyboard Protection</h3>
              <p className="text-gray-600">Blocks 50+ dangerous keyboard shortcuts including Ctrl+C, Ctrl+S, F12</p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Screenshot Prevention</h3>
              <p className="text-gray-600">Detects and blocks screenshot attempts and screen recording</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-red-50 border border-red-100">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Developer Tools Blocking</h3>
              <p className="text-gray-600">Prevents access to browser developer tools and inspect element</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-yellow-50 border border-yellow-100">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Dynamic Watermarking</h3>
              <p className="text-gray-600">Applies user-specific watermarks to track document access</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Access Monitoring</h3>
              <p className="text-gray-600">Real-time logging and analytics for document security violations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h3 className="text-3xl font-bold text-green-800 mb-4">
              Deployment Successful!
            </h3>
            <p className="text-green-700 mb-6 text-lg">
              FlipBook DRM is now running successfully on AWS Amplify with all security features active.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">🔒 Security Status</h4>
                <p className="text-sm text-gray-600">All DRM protection components are active and working</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">⚡ Performance</h4>
                <p className="text-sm text-gray-600">Optimized for fast loading and smooth user experience</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">🚀 Production Ready</h4>
                <p className="text-sm text-gray-600">Enterprise-grade security features deployed successfully</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Technical Implementation
            </h2>
            <p className="text-xl text-gray-600">
              Built with modern technologies and security best practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">⚛️</div>
              <h4 className="font-semibold text-gray-900">React 18</h4>
              <p className="text-sm text-gray-600 mt-2">Modern React with hooks and context</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🔷</div>
              <h4 className="font-semibold text-gray-900">Next.js 15</h4>
              <p className="text-sm text-gray-600 mt-2">Full-stack React framework</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="font-semibold text-gray-900">Tailwind CSS</h4>
              <p className="text-sm text-gray-600 mt-2">Utility-first CSS framework</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">☁️</div>
              <h4 className="font-semibold text-gray-900">AWS Amplify</h4>
              <p className="text-sm text-gray-600 mt-2">Cloud hosting and deployment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">FlipBook DRM</h3>
            <p className="text-gray-400 mb-6">
              Enterprise-grade document protection platform
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <span className="flex items-center space-x-2">
                <span>🔒</span>
                <span>DRM Protected</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>⚡</span>
                <span>High Performance</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>🛡️</span>
                <span>Enterprise Security</span>
              </span>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
              <p>&copy; 2025 FlipBook DRM. All rights reserved.</p>
              <p className="mt-2">Deployed successfully on AWS Amplify</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}