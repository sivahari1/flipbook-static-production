'use client'

import { motion, useInView, useScroll, useTransform, Variants } from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
import { fadeInVariants, getAnimationVariants, staggerContainerVariants } from '@/lib/animations'
import { useAccessibilityContext } from '@/contexts/AccessibilityContext'
import { AccessibleMotionDiv } from './AccessibleMotion'

interface ScrollTriggerProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
  variants?: Variants
  stagger?: boolean
  staggerDelay?: number
  onEnter?: () => void
  onExit?: () => void
  parallax?: boolean
  parallaxOffset?: number
  ariaLabel?: string
  ariaDescribedBy?: string
  respectReducedMotion?: boolean
  announceOnEnter?: string
}

interface ProgressTrackerProps {
  children: React.ReactNode
  className?: string
  onProgress?: (progress: number) => void
}

interface StaggeredScrollTriggerProps {
  children: React.ReactNode[]
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
  variants?: Variants
  staggerDelay?: number
}

export function ScrollTrigger({ 
  children, 
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  className = '',
  variants = fadeInVariants,
  stagger = false,
  staggerDelay = 0.1,
  onEnter,
  onExit,
  parallax = false,
  parallaxOffset = 50,
  ariaLabel,
  ariaDescribedBy,
  respectReducedMotion = true,
  announceOnEnter
}: ScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { config, announceToScreenReader } = useAccessibilityContext()
  
  const isInView = useInView(ref, { 
    once: triggerOnce,
    margin: rootMargin as any,
    amount: threshold
  })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Disable parallax if reduced motion is preferred
  const shouldUseParallax = parallax && config.enableParallax
  const y = useTransform(scrollYProgress, [0, 1], [parallaxOffset, -parallaxOffset])

  useEffect(() => {
    if (isInView) {
      if (onEnter) {
        onEnter()
      }
      // Announce to screen readers when content becomes visible
      if (announceOnEnter) {
        announceToScreenReader(announceOnEnter)
      }
    } else if (!isInView && onExit && !triggerOnce) {
      onExit()
    }
  }, [isInView, onEnter, onExit, triggerOnce, announceOnEnter, announceToScreenReader])

  const animationVariants = getAnimationVariants(variants, { respectReducedMotion })
  const containerVariants = stagger ? getAnimationVariants(staggerContainerVariants, { respectReducedMotion }) : undefined

  // Adjust stagger delay based on accessibility preferences
  const adjustedStaggerDelay = config.enableAnimations ? staggerDelay : 0

  const motionProps = {
    ref,
    initial: "hidden",
    animate: isInView ? "visible" : "hidden",
    variants: containerVariants || animationVariants,
    className,
    ...(shouldUseParallax && { style: { y } }),
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy })
  }

  if (stagger && Array.isArray(children)) {
    return (
      <AccessibleMotionDiv 
        {...motionProps}
        respectReducedMotion={respectReducedMotion}
      >
        {children.map((child, index) => (
          <AccessibleMotionDiv
            key={index}
            variants={animationVariants}
            transition={{ delay: index * adjustedStaggerDelay }}
            respectReducedMotion={respectReducedMotion}
          >
            {child}
          </AccessibleMotionDiv>
        ))}
      </AccessibleMotionDiv>
    )
  }

  return (
    <AccessibleMotionDiv 
      {...motionProps}
      respectReducedMotion={respectReducedMotion}
    >
      {children}
    </AccessibleMotionDiv>
  )
}

export function StaggeredScrollTrigger({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  className = '',
  variants = fadeInVariants,
  staggerDelay = 0.1
}: StaggeredScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    once: triggerOnce,
    margin: rootMargin as any,
    amount: threshold
  })

  const animationVariants = getAnimationVariants(variants)
  const containerVariants = getAnimationVariants(staggerContainerVariants)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={animationVariants}
          custom={index}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export function ProgressTracker({ 
  children, 
  className = '',
  onProgress 
}: ProgressTrackerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setProgress(latest)
      if (onProgress) {
        onProgress(latest)
      }
    })

    return () => unsubscribe()
  }, [scrollYProgress, onProgress])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Hook for advanced scroll-based animations
export function useScrollAnimation(options: {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  onEnter?: () => void
  onExit?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: options.triggerOnce ?? true,
    margin: (options.rootMargin ?? '0px') as any,
    amount: options.threshold ?? 0.1
  })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  useEffect(() => {
    if (isInView && options.onEnter) {
      options.onEnter()
    } else if (!isInView && options.onExit && !options.triggerOnce) {
      options.onExit()
    }
  }, [isInView, options])

  return {
    ref,
    isInView,
    scrollYProgress
  }
}