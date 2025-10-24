'use client'

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ParallaxProps {
  children: ReactNode
  offset?: number
  className?: string
  speed?: number
}

interface ParallaxLayerProps {
  children: ReactNode
  speed: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

interface ParallaxContainerProps {
  children: ReactNode
  className?: string
  height?: string
}

export function Parallax({ 
  children, 
  offset = 50, 
  className = '',
  speed = 0.5
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [offset * speed, -offset * speed])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}

export function ParallaxLayer({ 
  children, 
  speed, 
  className = '',
  direction = 'up'
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const getTransform = (): MotionValue<number> => {
    const range = 100 * speed
    
    switch (direction) {
      case 'up':
        return useTransform(scrollYProgress, [0, 1], [range, -range])
      case 'down':
        return useTransform(scrollYProgress, [0, 1], [-range, range])
      case 'left':
        return useTransform(scrollYProgress, [0, 1], [range, -range])
      case 'right':
        return useTransform(scrollYProgress, [0, 1], [-range, range])
      default:
        return useTransform(scrollYProgress, [0, 1], [range, -range])
    }
  }

  const transform = getTransform()
  const isHorizontal = direction === 'left' || direction === 'right'

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={isHorizontal ? { x: transform } : { y: transform }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}

export function ParallaxContainer({ 
  children, 
  className = '',
  height = 'h-screen'
}: ParallaxContainerProps) {
  return (
    <div className={cn('relative overflow-hidden', height, className)}>
      {children}
    </div>
  )
}

// Multi-layer parallax effect
export function MultiLayerParallax({
  layers,
  className = ''
}: {
  layers: Array<{
    content: ReactNode
    speed: number
    zIndex?: number
    className?: string
  }>
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  return (
    <div ref={ref} className={cn('relative', className)}>
      {layers.map((layer, index) => {
        const y = useTransform(
          scrollYProgress, 
          [0, 1], 
          [100 * layer.speed, -100 * layer.speed]
        )

        return (
          <motion.div
            key={index}
            style={{ 
              y,
              zIndex: layer.zIndex || index
            }}
            className={cn('absolute inset-0', layer.className)}
          >
            {layer.content}
          </motion.div>
        )
      })}
    </div>
  )
}

// Background parallax with image
export function ParallaxBackground({
  src,
  alt = '',
  className = '',
  speed = 0.5,
  overlay = false,
  overlayColor = 'bg-black/20'
}: {
  src: string
  alt?: string
  className?: string
  speed?: number
  overlay?: boolean
  overlayColor?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </motion.div>
      {overlay && (
        <div className={cn('absolute inset-0', overlayColor)} />
      )}
    </div>
  )
}

// Text parallax effect
export function ParallaxText({
  children,
  className = '',
  speed = 0.3
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [50 * speed, -50 * speed])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ y, opacity }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Hook for custom parallax effects
export function useParallax(speed: number = 0.5, direction: 'vertical' | 'horizontal' = 'vertical') {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const transform = useTransform(
    scrollYProgress, 
    [0, 1], 
    direction === 'vertical' 
      ? [100 * speed, -100 * speed]
      : [100 * speed, -100 * speed]
  )

  return {
    ref,
    transform,
    scrollYProgress
  }
}