'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock } from 'lucide-react'

interface SessionNotificationProps {
  show: boolean
  message: string
  type?: 'success' | 'info'
  duration?: number
  onHide?: () => void
}

export function SessionNotification({
  show,
  message,
  type = 'success',
  duration = 3000,
  onHide
}: SessionNotificationProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onHide?.()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, duration, onHide])

  const Icon = type === 'success' ? CheckCircle : Clock
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-blue-500'
  const iconColor = type === 'success' ? 'text-green-600' : 'text-blue-600'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
            <Icon className={`w-5 h-5 ${iconColor} bg-white rounded-full p-1`} />
            <span className="text-sm font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}