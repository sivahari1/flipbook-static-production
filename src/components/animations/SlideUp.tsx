'use client'

import { motion } from 'framer-motion'

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideUp({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  distance = 60,
  className = ''
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: distance,
      }}
      animate={{ 
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: [0.0, 0.0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}