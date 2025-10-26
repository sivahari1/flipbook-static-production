'use client'

import { useState } from 'react'
import { DRMProtection } from '@/components/security/DRMProtection'
import { useDRMProtection } from '@/hooks/useDRMProtection'
import { SecurityViolation } from '@/lib/drm-protection'
import { Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react'

export function DRMProtectionDemo() {
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  const drm = useDRMProtection({
    enabled: isEnabled,
    onViolation: (violation) => {
      setViolations(prev => [...prev, violation])
    },
    autoActivate: true,
    logViolations: false, // Don't log demo violations
    showWarnings: true
  })

  const handleViolation = (violation: SecurityViolation) => {
    setViolations(prev => [...prev, violation])
  }

  const clearViolations = () => {
    setViolations([])
    drm.clearViolations()
  }

  const getSeverityColor = (severity: SecurityViolation['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'high': return 'text-red-600 bg-red-50'
      case 'critical': return 'text-red-800 bg-red-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: SecurityViolation['severity']) => {
    switch (severity) {
      case 'low': return '⚠️'
      case 'medium': return '🚨'
      case 'high': return '🔒'
      case 'critical': return '🛡️'
      default: return '❓'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">DRM Protection Demo</h2>
              <p className="text-gray-600">Test the security features of our DRM system</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              drm.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {drm.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {drm.isActive ? 'Protected' : 'Unprotected'}
              </span>
            </div>
            
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEnabled 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isEnabled ? 'Disable DRM' : 'Enable DRM'}
            </button>
          </div>
        </div>

        {/* Protected Content Area */}
        <DRMProtection
          enabled={isEnabled}
          onViolation={handleViolation}
          showWarnings={true}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8"
        >
          <div className="text-center space-y-4">
            <div className="text-6xl">📄</div>
            <h3 className="text-xl font-semibold text-gray-900">Protected Document Content</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              This area is protected by DRM. Try right-clicking, selecting text, or using keyboard shortcuts 
              like Ctrl+C, Ctrl+A, or F12 to see the protection in action.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Try These Actions:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Right-click (context menu)</li>
                  <li>• Select this text</li>
                  <li>• Press Ctrl+C (copy)</li>
                  <li>• Press Ctrl+A (select all)</li>
                  <li>• Press Ctrl+S (save)</li>
                  <li>• Press Ctrl+P (print)</li>
                  <li>• Press F12 (dev tools)</li>
                  <li>• Press Ctrl+Shift+I (inspect)</li>
                  <li>• Press Print Screen</li>
                  <li>• Press Ctrl+U (view source)</li>
                  <li>• Press Ctrl+F (find)</li>
                  <li>• Press Alt+Tab (switch apps)</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Protection Features:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Context menu blocking</li>
                  <li>• Text selection disabled</li>
                  <li>• Enhanced keyboard shortcut blocking</li>
                  <li>• Function key blocking (F1-F12)</li>
                  <li>• Copy/paste/cut prevention</li>
                  <li>• Save/print operation blocking</li>
                  <li>• Developer tools detection</li>
                  <li>• Screenshot detection & blocking</li>
                  <li>• Drag & drop prevention</li>
                  <li>• Cross-platform support (Win/Mac)</li>
                  <li>• App switching detection</li>
                  <li>• View source blocking</li>
                </ul>
              </div>
            </div>
          </div>
        </DRMProtection>

        {/* Violation Log */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Security Violations Log</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Total: {violations.length}
              </span>
              {violations.length > 0 && (
                <button
                  onClick={clearViolations}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {violations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No security violations detected yet.</p>
              <p className="text-sm">Try interacting with the protected content above.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {violations.slice().reverse().map((violation, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getSeverityColor(violation.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getSeverityIcon(violation.severity)}</span>
                      <div>
                        <div className="font-medium capitalize">
                          {violation.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm opacity-90">
                          {violation.details}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs opacity-75">
                      {violation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          {(['low', 'medium', 'high', 'critical'] as const).map(severity => {
            const count = violations.filter(v => v.severity === severity).length
            return (
              <div key={severity} className={`p-3 rounded-lg text-center ${getSeverityColor(severity)}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm capitalize">{severity}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}