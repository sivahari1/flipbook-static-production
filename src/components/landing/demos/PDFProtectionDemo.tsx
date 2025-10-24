'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function PDFProtectionDemo() {
  const [protectionLevel, setProtectionLevel] = useState(0)
  const [isProtected, setIsProtected] = useState(false)
  
  const protectionLevels = [
    { 
      name: 'Basic', 
      color: 'bg-yellow-500', 
      features: ['Password Protection', 'Download Control'],
      icon: '🔒'
    },
    { 
      name: 'Advanced', 
      color: 'bg-orange-500', 
      features: ['Watermarking', 'Time Limits', 'IP Restrictions'],
      icon: '🛡️'
    },
    { 
      name: 'Enterprise', 
      color: 'bg-red-500', 
      features: ['DRM Protection', 'Screen Capture Block', 'Audit Logs'],
      icon: '🔐'
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProtectionLevel((prev) => (prev + 1) % protectionLevels.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [protectionLevels.length])

  const toggleProtection = () => {
    setIsProtected(!isProtected)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">PDF Protection Levels</h3>
      
      {/* PDF Document Mockup */}
      <motion.div
        className="relative bg-white rounded-lg shadow-lg border-2 border-gray-200 w-64 h-80 overflow-hidden"
        whileHover={{ scale: 1.02 }}
        animate={{
          borderColor: isProtected ? protectionLevels[protectionLevel].color.replace('bg-', '#') : '#E5E7EB'
        }}
      >
        {/* PDF Header */}
        <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Document.pdf</span>
          <motion.button
            onClick={toggleProtection}
            className={`
              px-2 py-1 rounded text-xs font-medium transition-all
              ${isProtected ? protectionLevels[protectionLevel].color + ' text-white' : 'bg-gray-300 text-gray-600'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isProtected ? 'Protected' : 'Unprotected'}
          </motion.button>
        </div>

        {/* PDF Content */}
        <div className="p-4 space-y-2">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`h-3 rounded ${i % 4 === 0 ? 'w-3/4' : i % 3 === 0 ? 'w-5/6' : 'w-full'}`}
              animate={{
                backgroundColor: isProtected ? '#F3F4F6' : '#E5E7EB'
              }}
            />
          ))}
        </div>

        {/* Protection Overlay */}
        {isProtected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/5 flex items-center justify-center"
          >
            <motion.div
              className={`
                ${protectionLevels[protectionLevel].color} text-white 
                px-4 py-2 rounded-lg shadow-lg text-center
              `}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="text-2xl mb-1">{protectionLevels[protectionLevel].icon}</div>
              <div className="text-sm font-semibold">
                {protectionLevels[protectionLevel].name}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Attempt Access Overlay */}
        <motion.div
          className="absolute inset-0 bg-red-500/20 opacity-0"
          whileHover={{ opacity: isProtected ? 1 : 0 }}
        >
          {isProtected && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium">
                Access Denied!
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Protection Level Selector */}
      <div className="flex space-x-2">
        {protectionLevels.map((level, index) => (
          <motion.button
            key={index}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${index === protectionLevel 
                ? level.color + ' text-white shadow-lg' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }
            `}
            onClick={() => setProtectionLevel(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {level.icon} {level.name}
          </motion.button>
        ))}
      </div>

      {/* Features List */}
      <motion.div
        key={protectionLevel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 shadow-md w-full max-w-sm"
      >
        <h4 className="font-semibold text-center mb-3">
          {protectionLevels[protectionLevel].name} Protection Features
        </h4>
        <div className="space-y-2">
          {protectionLevels[protectionLevel].features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className={`w-2 h-2 rounded-full ${protectionLevels[protectionLevel].color}`} />
              <span className="text-sm text-gray-700">{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}