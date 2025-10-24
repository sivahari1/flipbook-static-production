'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function SecurityDemo() {
  const [step, setStep] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  
  const steps = [
    { 
      label: 'Document Upload', 
      icon: '📄', 
      color: 'bg-blue-500',
      description: 'Secure file upload with client-side validation and virus scanning',
      details: ['File type validation', 'Size limits', 'Malware detection']
    },
    { 
      label: 'Encryption', 
      icon: '🔐', 
      color: 'bg-purple-500',
      description: 'Military-grade AES-256 encryption protects your content',
      details: ['AES-256 encryption', 'Unique keys per file', 'Zero-knowledge architecture']
    },
    { 
      label: 'Secure Storage', 
      icon: '☁️', 
      color: 'bg-green-500',
      description: 'Encrypted files stored in secure cloud infrastructure',
      details: ['Distributed storage', 'Redundant backups', 'Geographic distribution']
    },
    { 
      label: 'Access Control', 
      icon: '🛡️', 
      color: 'bg-orange-500',
      description: 'Granular permissions control who can access what',
      details: ['Role-based access', 'Time-limited links', 'IP restrictions']
    },
  ]

  useEffect(() => {
    if (!isHovered && selectedStep === null) {
      const interval = setInterval(() => {
        setStep((prev) => (prev + 1) % steps.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [steps.length, isHovered, selectedStep])

  const currentStep = selectedStep !== null ? selectedStep : step

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center space-y-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setSelectedStep(null)
      }}
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Security Pipeline</h3>
      
      {/* Security Steps */}
      <div className="flex items-center justify-center space-x-8 relative">
        {steps.map((stepItem, index) => (
          <div key={index} className="flex flex-col items-center relative">
            <motion.div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer
                transition-all duration-500 relative z-10
                ${index === currentStep ? stepItem.color + ' text-white shadow-lg' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}
              `}
              animate={{
                scale: index === currentStep ? 1.15 : 1,
                boxShadow: index === currentStep ? '0 15px 35px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)'
              }}
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              onClick={() => setSelectedStep(index)}
            >
              {stepItem.icon}
              
              {/* Pulse effect for active step */}
              {index === currentStep && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${stepItem.color} opacity-30`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
            
            <span className={`mt-3 text-sm font-medium transition-colors ${index === currentStep ? 'text-gray-800' : 'text-gray-500'}`}>
              {stepItem.label}
            </span>
            
            {/* Connection Lines */}
            {index < steps.length - 1 && (
              <motion.div
                className="absolute top-8 left-16 w-16 h-0.5 bg-gray-300 z-0"
                animate={{
                  backgroundColor: index < currentStep ? '#10B981' : '#D1D5DB',
                  scaleX: index < currentStep ? 1 : 0.7
                }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Security Features */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-lg max-w-md text-center border border-gray-100"
      >
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${steps[currentStep].color} text-white text-xl mb-4`}>
          {steps[currentStep].icon}
        </div>
        
        <h4 className="font-bold text-lg mb-2 text-gray-800">
          {steps[currentStep].label}
        </h4>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {steps[currentStep].description}
        </p>

        {/* Feature Details */}
        <div className="space-y-2">
          {steps[currentStep].details.map((detail, index) => (
            <motion.div
              key={detail}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-center space-x-2 text-sm text-gray-700"
            >
              <div className={`w-2 h-2 rounded-full ${steps[currentStep].color}`} />
              <span>{detail}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}