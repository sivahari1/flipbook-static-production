'use client'

import { motion } from 'framer-motion'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  direction = 'up',
  className = ''
}: FadeInProps) {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { x: 0, y: 20 }
      case 'down': return { x: 0, y: -20 }
      case 'left': return { x: 20, y: 0 }
      case 'right': return { x: -20, y: 0 }
      default: return { x: 0, y: 20 }
    }
  }

  const offset = getDirectionOffset()

  return (
    <motion.div
      initial={{ 
        opacity: 0,
        x: offset.x,
        y: offset.y,
      }}
      animate={{ 
        opacity: 1,
        x: 0,
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