'use client'

import { motion } from 'framer-motion'
import { Check, CheckCircle } from 'lucide-react'

interface SuccessAnimationProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'check' | 'circle' | 'checkmark'
  className?: string
}

export function SuccessAnimation({ 
  size = 'md', 
  variant = 'checkmark',
  className = '' 
}: SuccessAnimationProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (variant === 'circle') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
        className={className}
      >
        <CheckCircle className={`${sizeClasses[size]} text-green-500`} />
      </motion.div>
    )
  }

  if (variant === 'check') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
        className={className}
      >
        <Check className={`${sizeClasses[size]} text-green-500`} />
      </motion.div>
    )
  }

  // Custom animated checkmark
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className={`${className} relative`}
    >
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <motion.svg
          className="w-1/2 h-1/2 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              ease: 'easeInOut'
            }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}

export function FormSuccessOverlay({ 
  isVisible, 
  message = 'Success!',
  onComplete 
}: {
  isVisible: boolean
  message?: string
  onComplete?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isVisible ? 1 : 0, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20
        }}
        onAnimationComplete={() => {
          if (isVisible) {
            setTimeout(() => onComplete?.(), 1500)
          }
        }}
        className="bg-white rounded-2xl p-8 shadow-2xl text-center space-y-4 max-w-sm mx-4"
      >
        <SuccessAnimation size="lg" variant="checkmark" className="mx-auto" />
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-semibold text-gray-900"
        >
          {message}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600"
        >
          Redirecting you now...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}