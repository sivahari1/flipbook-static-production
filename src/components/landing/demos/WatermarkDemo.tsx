'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function WatermarkDemo() {
  const [isHovered, setIsHovered] = useState(false)
  const [watermarkVisible, setWatermarkVisible] = useState(true)
  const [watermarkType, setWatermarkType] = useState(0)
  const [screenshotAttempt, setScreenshotAttempt] = useState(false)

  const watermarkTypes = [
    {
      name: 'User Email',
      content: 'user@example.com',
      color: 'text-blue-500',
      rotation: -45
    },
    {
      name: 'Timestamp',
      content: new Date().toLocaleString(),
      color: 'text-purple-500',
      rotation: -30
    },
    {
      name: 'Session ID',
      content: 'SID: ABC123XYZ',
      color: 'text-green-500',
      rotation: -60
    },
    {
      name: 'Custom Text',
      content: 'CONFIDENTIAL',
      color: 'text-red-500',
      rotation: -45
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkVisible(prev => !prev)
      setWatermarkType(prev => (prev + 1) % watermarkTypes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [watermarkTypes.length])

  const handleScreenshotAttempt = () => {
    setScreenshotAttempt(true)
    setTimeout(() => setScreenshotAttempt(false), 2000)
  }

  const currentWatermark = watermarkTypes[watermarkType]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Dynamic Watermarks</h3>
      
      {/* Watermark Type Selector */}
      <div className="flex space-x-2 mb-4">
        {watermarkTypes.map((type, index) => (
          <motion.button
            key={index}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-all
              ${index === watermarkType 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }
            `}
            onClick={() => setWatermarkType(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {type.name}
          </motion.button>
        ))}
      </div>
      
      {/* PDF Mockup */}
      <motion.div
        className="relative bg-white rounded-lg shadow-lg p-8 w-80 h-64 border-2 border-gray-200 cursor-pointer overflow-hidden"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleScreenshotAttempt}
        whileHover={{ scale: 1.02 }}
        animate={{
          borderColor: screenshotAttempt ? '#EF4444' : '#E5E7EB'
        }}
      >
        {/* Document Content */}
        <div className="space-y-3 relative z-10">
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
        </div>

        {/* Dynamic Watermark */}
        <motion.div
          key={watermarkType}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: watermarkVisible ? 0.4 : 0.2,
            scale: watermarkVisible ? 1 : 0.9,
            rotate: currentWatermark.rotation,
          }}
          transition={{ duration: 1 }}
        >
          <div className={`${currentWatermark.color} font-bold text-lg select-none text-center leading-tight`}>
            {currentWatermark.content}
          </div>
        </motion.div>

        {/* Multiple Watermark Pattern */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute ${currentWatermark.color} opacity-10 text-xs font-medium select-none`}
              style={{
                top: `${20 + (i % 3) * 30}%`,
                left: `${10 + (i % 2) * 60}%`,
                transform: `rotate(${currentWatermark.rotation + (i * 10)}deg)`
              }}
              animate={{
                opacity: watermarkVisible ? 0.15 : 0.05,
              }}
            >
              {currentWatermark.content}
            </motion.div>
          ))}
        </div>

        {/* Screenshot Detection Overlay */}
        {(isHovered || screenshotAttempt) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center z-30"
          >
            <motion.div
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
              animate={{
                scale: screenshotAttempt ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {screenshotAttempt ? '🚫 Screenshot Blocked!' : '⚠️ Screenshot Detected!'}
            </motion.div>
          </motion.div>
        )}

        {/* Security Indicators */}
        <div className="absolute top-2 right-2 flex space-x-1 z-30">
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
        </div>
      </motion.div>

      {/* Features List */}
      <motion.div
        key={watermarkType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 shadow-md w-full max-w-sm"
      >
        <h4 className="font-semibold text-center mb-3 text-gray-800">
          Active Watermark: {currentWatermark.name}
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">Real-time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">Unique ID</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">Invisible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">Traceable</span>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-sm text-gray-500 max-w-xs">
        Click on the document to simulate screenshot detection
      </p>
    </div>
  )
}