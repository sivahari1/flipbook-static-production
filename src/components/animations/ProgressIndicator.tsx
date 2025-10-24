'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  className?: string
  color?: string
  height?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
  showPercentage?: boolean
  target?: React.RefObject<HTMLElement>
}

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  className?: string
}

interface ReadingProgressProps {
  target?: React.RefObject<HTMLElement>
  className?: string
  color?: string
}

export function ProgressIndicator({
  className = '',
  color = 'bg-blue-500',
  height = 4,
  position = 'top',
  showPercentage = false,
  target
}: ProgressIndicatorProps) {
  const { scrollYProgress } = useScroll(target ? { target } : undefined)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setProgress(latest * 100)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    left: 'top-0 bottom-0 left-0 w-1',
    right: 'top-0 bottom-0 right-0 w-1'
  }

  const isHorizontal = position === 'top' || position === 'bottom'

  return (
    <div className={cn(
      'fixed z-50',
      positionClasses[position],
      className
    )}>
      <motion.div
        className={cn(
          color,
          isHorizontal ? `h-${height}` : `w-${height}`
        )}
        style={isHorizontal ? { scaleX, originX: 0 } : { scaleY: scaleX, originY: 0 }}
      />
      {showPercentage && (
        <div className="fixed top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}

export function CircularProgress({
  progress,
  size = 60,
  strokeWidth = 4,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  className = ''
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium" style={{ color }}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

export function ReadingProgress({ target, className = '', color = 'bg-blue-500' }: ReadingProgressProps) {
  const { scrollYProgress } = useScroll(target ? { target } : undefined)
  
  return (
    <motion.div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 z-50 origin-left',
        color,
        className
      )}
      style={{ scaleX: scrollYProgress }}
    />
  )
}

// Hook for tracking scroll progress
export function useScrollProgress(target?: React.RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll(target ? { target } : undefined)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setProgress(latest)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  return {
    progress,
    scrollYProgress,
    percentage: Math.round(progress * 100)
  }
}