'use client'

import { useEffect, useState } from 'react'
import { 
  isMobile, 
  isTablet, 
  isTouchDevice, 
  isLowEndDevice, 
  getDeviceAnimationConfig,
  shouldReduceMotion 
} from '@/lib/animations'

interface DeviceCapabilities {
  isMobile: boolean
  isTablet: boolean
  isTouch: boolean
  isLowEnd: boolean
  reduceMotion: boolean
  animationConfig: ReturnType<typeof getDeviceAnimationConfig>
}

export function useMobileAnimations(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    isLowEnd: false,
    reduceMotion: false,
    animationConfig: getDeviceAnimationConfig(),
  })

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isTouch: isTouchDevice(),
        isLowEnd: isLowEndDevice(),
        reduceMotion: shouldReduceMotion(),
        animationConfig: getDeviceAnimationConfig(),
      })
    }

    // Initial check
    updateCapabilities()

    // Listen for resize events to update mobile/tablet detection
    const handleResize = () => {
      updateCapabilities()
    }

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => {
      updateCapabilities()
    }

    window.addEventListener('resize', handleResize)
    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return capabilities
}

// Hook for getting optimized animation variants based on device
export function useOptimizedAnimations() {
  const { isMobile, isLowEnd, reduceMotion, animationConfig } = useMobileAnimations()

  const getVariants = (baseVariants: any) => {
    if (reduceMotion) {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    }

    if (isLowEnd || isMobile) {
      // Simplified animations for mobile/low-end devices
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            duration: animationConfig.duration.fast,
            ease: animationConfig.easing.easeOut,
          }
        },
      }
    }

    return baseVariants
  }

  const getSpringConfig = () => {
    if (isLowEnd || isMobile) {
      return {
        type: "tween" as const,
        duration: animationConfig.duration.fast,
      }
    }

    return {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    }
  }

  const getStaggerDelay = () => {
    return isLowEnd || isMobile 
      ? animationConfig.stagger.fast 
      : animationConfig.stagger.normal
  }

  return {
    getVariants,
    getSpringConfig,
    getStaggerDelay,
    animationConfig,
  }
}