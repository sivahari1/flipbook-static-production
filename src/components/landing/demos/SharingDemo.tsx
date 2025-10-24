'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function SharingDemo() {
  const [step, setStep] = useState(0)
  const [linkGenerated, setLinkGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiryTime, setExpiryTime] = useState('24 hours')
  const [maxOpens, setMaxOpens] = useState(5)
  const [passwordRequired, setPasswordRequired] = useState(false)
  
  const steps = [
    { 
      title: 'Create Share Link', 
      description: 'Generate secure, time-limited access links',
      icon: '🔗',
      color: 'bg-blue-500'
    },
    { 
      title: 'Set Permissions', 
      description: 'Configure access controls and restrictions',
      icon: '⚙️',
      color: 'bg-purple-500'
    },
    { 
      title: 'Share Securely', 
      description: 'Send links with built-in security measures',
      icon: '📤',
      color: 'bg-green-500'
    },
    { 
      title: 'Track Access', 
      description: 'Monitor who accessed your documents when',
      icon: '📊',
      color: 'bg-orange-500'
    }
  ]

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const generateLink = () => {
    setLinkGenerated(true)
    setTimeout(() => setStep(1), 500)
  }

  const copyLink = () => {
    setCopied(true)
    // In a real app, this would copy to clipboard
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Sharing Workflow</h3>
      
      {/* Step Indicator */}
      <div className="flex items-center space-x-4 mb-6">
        {steps.map((stepItem, index) => (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-lg cursor-pointer
                transition-all duration-300
                ${index === step ? stepItem.color + ' text-white shadow-lg' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}
              `}
              animate={{
                scale: index === step ? 1.1 : 1,
                boxShadow: index === step ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep(index)}
            >
              {stepItem.icon}
            </motion.div>
            <span className={`mt-2 text-xs font-medium ${index === step ? 'text-gray-800' : 'text-gray-500'}`}>
              Step {index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Share Link Generator */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-100"
      >
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${steps[step].color} text-white text-2xl mb-4`}>
                {steps[step].icon}
              </div>
              <h4 className="font-bold text-lg mb-2">{steps[step].title}</h4>
            </div>
            
            {!linkGenerated ? (
              <motion.button
                onClick={generateLink}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Generate Secure Link
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secure Link Generated
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-100 rounded px-3 py-2 text-sm font-mono text-blue-600">
                      https://secure.link/abc123...
                    </div>
                    <motion.button
                      onClick={copyLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copied ? '✓' : 'Copy'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${steps[step].color} text-white text-2xl mb-4`}>
                {steps[step].icon}
              </div>
              <h4 className="font-bold text-lg mb-2">{steps[step].title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires
                </label>
                <select 
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>1 hour</option>
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Opens
                </label>
                <input 
                  type="number" 
                  value={maxOpens}
                  onChange={(e) => setMaxOpens(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <motion.div 
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              whileHover={{ backgroundColor: '#F3F4F6' }}
            >
              <input 
                type="checkbox" 
                id="password" 
                checked={passwordRequired}
                onChange={(e) => setPasswordRequired(e.target.checked)}
                className="rounded text-purple-500 focus:ring-purple-500" 
              />
              <label htmlFor="password" className="text-sm text-gray-700 font-medium">
                Require password protection
              </label>
            </motion.div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${steps[step].color} text-white text-2xl mb-4`}>
              {steps[step].icon}
            </div>
            <h4 className="font-bold text-lg mb-2">{steps[step].title}</h4>
            
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <span className="text-lg">✅</span>
                  <span className="font-medium">Link configured successfully</span>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  Expires in {expiryTime} • Max {maxOpens} opens • {passwordRequired ? 'Password protected' : 'No password'}
                </div>
              </div>
              
              <motion.button
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(3)}
              >
                Send Link
              </motion.button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${steps[step].color} text-white text-2xl mb-4`}>
              {steps[step].icon}
            </div>
            <h4 className="font-bold text-lg mb-2">{steps[step].title}</h4>
            
            <div className="space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-medium text-orange-800 mb-2">Access Analytics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views:</span>
                    <span className="font-medium">3 / {maxOpens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Access:</span>
                    <span className="font-medium">2 min ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Step Description */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <p className="text-gray-600 text-sm leading-relaxed">{steps[step].description}</p>
      </motion.div>
    </div>
  )
}