'use client'

import { useState } from 'react'
import { DRMProtection } from '@/components/security/DRMProtection'
import KeyboardShortcutBlocker from '@/components/security/KeyboardShortcutBlocker'
import { SecurityViolation } from '@/lib/drm-protection'
import { Keyboard, Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react'

export default function KeyboardBlockingDemoPage() {
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [strictMode, setStrictMode] = useState(true)
  const [showStats, setShowStats] = useState(true)

  const handleViolation = (violation: SecurityViolation) => {
    setViolations(prev => [...prev, violation])
  }

  const clearViolations = () => {
    setViolations([])
  }

  const getViolationsByType = (type: SecurityViolation['type']) => {
    return violations.filter(v => v.type === type)
  }

  const getRecentViolations = (minutes: number = 1) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return violations.filter(v => v.timestamp > cutoff)
  }

  const getSeverityColor = (severity: SecurityViolation['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'critical': return 'text-red-800 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const keyboardShortcuts = [
    { category: 'Copy/Paste Operations', shortcuts: ['Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+A'] },
    { category: 'Save Operations', shortcuts: ['Ctrl+S', 'Ctrl+Shift+S'] },
    { category: 'Print Operations', shortcuts: ['Ctrl+P'] },
    { category: 'Developer Tools', shortcuts: ['F12', 'Ctrl+Shift+I', 'Ctrl+Shift+J', 'Ctrl+Shift+C'] },
    { category: 'View Source', shortcuts: ['Ctrl+U', 'Ctrl+I'] },
    { category: 'Browser Functions', shortcuts: ['Ctrl+H', 'Ctrl+J', 'Ctrl+D', 'Ctrl+F', 'Ctrl+R'] },
    { category: 'Screenshot Tools', shortcuts: ['Print Screen', 'Alt+Print Screen', 'Win+Shift+S'] },
    { category: 'Function Keys', shortcuts: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'] },
    { category: 'Mac Shortcuts', shortcuts: ['Cmd+C', 'Cmd+V', 'Cmd+S', 'Cmd+P', 'Cmd+Shift+I'] },
    { category: 'System Shortcuts', shortcuts: ['Alt+Tab', 'Alt+F4', 'Ctrl+Alt+Delete'] }
  ]

  return (
    <>
      {/* Enhanced Keyboard Shortcut Blocker */}
      <KeyboardShortcutBlocker
        enabled={isEnabled}
        onViolation={handleViolation}
        strictMode={strictMode}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Keyboard className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Keyboard Shortcut Blocking Demo</h1>
                  <p className="text-gray-600">Test comprehensive keyboard shortcut protection</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  isEnabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isEnabled ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {isEnabled ? 'Protection Active' : 'Protection Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEnabled 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isEnabled ? 'Disable Protection' : 'Enable Protection'}
              </button>

              <button
                onClick={() => setStrictMode(!strictMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  strictMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {strictMode ? 'Disable Strict Mode' : 'Enable Strict Mode'}
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>

              {violations.length > 0 && (
                <button
                  onClick={clearViolations}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Log
                </button>
              )}
            </div>

            {/* Stats */}
            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{violations.length}</div>
                  <div className="text-sm text-blue-800">Total Violations</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{getRecentViolations().length}</div>
                  <div className="text-sm text-green-800">Last Minute</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {getViolationsByType('screenshot_attempt').length}
                  </div>
                  <div className="text-sm text-red-800">Screenshot Attempts</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getViolationsByType('devtools_opened').length}
                  </div>
                  <div className="text-sm text-purple-800">DevTools Attempts</div>
                </div>
              </div>
            )}
          </div>

          {/* Test Area */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Protected Test Area</h2>
            <DRMProtection
              enabled={isEnabled}
              onViolation={handleViolation}
              strictMode={strictMode}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8"
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">⌨️</div>
                <h3 className="text-xl font-semibold text-gray-900">Keyboard Protection Test Zone</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  This area is protected by enhanced keyboard shortcut blocking. Try any of the shortcuts 
                  listed below to see the protection in action. All attempts will be logged and blocked.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Live Testing Instructions</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Focus on this area and try the keyboard shortcuts below. Each blocked attempt will appear 
                    in the violation log with details about what was blocked and why.
                  </p>
                </div>
              </div>
            </DRMProtection>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blocked Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keyboardShortcuts.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{category.category}</h3>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, shortcutIndex) => (
                      <div
                        key={shortcutIndex}
                        className="flex items-center justify-between text-sm"
                      >
                        <code className="bg-white px-2 py-1 rounded border text-gray-800">
                          {shortcut}
                        </code>
                        <span className="text-red-500 text-xs">BLOCKED</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Violation Log */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Keyboard Violation Log</h2>
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
                <Keyboard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No keyboard violations detected yet.</p>
                <p className="text-sm">Try using some keyboard shortcuts in the test area above.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {violations.slice().reverse().map((violation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">
                          {violation.type === 'screenshot_attempt' && '📸'}
                          {violation.type === 'devtools_opened' && '🔧'}
                          {violation.type === 'copy_attempt' && '📋'}
                          {violation.type === 'print_attempt' && '🖨️'}
                          {violation.type === 'save_attempt' && '💾'}
                          {violation.type === 'unauthorized_access' && '🚫'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize text-sm">
                            {violation.type.replace('_', ' ')} - {violation.severity.toUpperCase()}
                          </div>
                          <div className="text-sm opacity-90 mt-1">
                            {violation.details}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs opacity-75 ml-4">
                        {violation.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}