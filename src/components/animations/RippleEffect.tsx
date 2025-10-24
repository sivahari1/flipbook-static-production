'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animationConfig } from '@/lib/animations'

interface Ripple {
  id: number
  x: number
  y: number
}

interface RippleEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
  disabled?: boolean
  onClick?: (event: React.MouseEvent) => void
  onTouchStart?: (event: React.TouchEvent) => void
}

export function RippleEffect({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
  disabled = false,
  onClick,
  onTouchStart,
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>()

  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return

    const rect = event.currentTarget.getBoundingClientRect()
    let x: number, y: number

    if ('touches' in event && event.touches.length > 0) {
      // Touch event
      x = event.touches[0].clientX - rect.left
      y = event.touches[0].clientY - rect.top
    } else if ('clientX' in event) {
      // Mouse event
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    } else {
      // Fallback to center
      x = rect.width / 2
      y = rect.height / 2
    }

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples(prev => [...(prev || []), newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev?.filter(ripple => ripple.id !== newRipple.id) || [])
    }, animationConfig.touch.rippleDuration * 1000)
  }, [disabled])

  const handleClick = (event: React.MouseEvent) => {
    createRipple(event)
    onClick?.(event)
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    createRipple(event)
    onTouchStart?.(event)
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      
      <AnimatePresence>
        {ripples?.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 0.8,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: animationConfig.touch.rippleDuration,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}