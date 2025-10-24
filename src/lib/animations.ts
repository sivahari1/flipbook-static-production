import { Variants } from 'framer-motion'
import { performanceOptimizer } from './performance-optimizer'

// Device detection utilities
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth > 768 && window.innerWidth <= 1024
}

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}

// Performance detection
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false
  
  // Check for reduced motion preference
  if (shouldReduceMotion()) return true
  
  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory
  if (deviceMemory && deviceMemory <= 2) return true
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true
  
  return false
}

// Animation configuration with device-specific settings
export const animationConfig = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
  },
  easing: {
    easeOut: [0.0, 0.0, 0.2, 1] as const,
    easeInOut: [0.4, 0.0, 0.2, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
  },
  stagger: {
    fast: 0.1,
    normal: 0.2,
    slow: 0.3,
  },
  // Mobile-specific configurations
  mobile: {
    duration: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.45,
    },
    stagger: {
      fast: 0.05,
      normal: 0.1,
      slow: 0.15,
    },
  },
  // Touch interaction settings
  touch: {
    tapScale: 0.95,
    rippleDuration: 0.6,
    feedbackDuration: 0.15,
  },
}

// Common animation variants
export const fadeInVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.easeOut,
    },
  },
}

export const slideUpVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 60,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.easeOut,
    },
  },
}

export const scaleInVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.easeOut,
    },
  },
}

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: animationConfig.stagger.normal,
    },
  },
}

export const parallaxVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 50,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.slow,
      ease: animationConfig.easing.easeOut,
    },
  },
}

export const slideInFromLeftVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: -60,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.easeOut,
    },
  },
}

export const slideInFromRightVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: 60,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.easeOut,
    },
  },
}

export const rotateInVariants: Variants = {
  hidden: { 
    opacity: 0,
    rotate: -10,
    scale: 0.9,
  },
  visible: { 
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.easing.bounce,
    },
  },
}

// Utility function to check for reduced motion preference
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Enhanced accessibility check for various motion preferences
export const getAccessibilityPreferences = () => {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersReducedTransparency: false,
      supportsHover: true
    }
  }

  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
    supportsHover: window.matchMedia('(hover: hover)').matches
  }
}

// Get animation variants based on accessibility preferences and device capabilities
export const getAnimationVariants = (variants: Variants, options?: {
  respectReducedMotion?: boolean
  fallbackToStatic?: boolean
  minimumDuration?: number
}): Variants => {
  const { 
    respectReducedMotion = true, 
    fallbackToStatic = true,
    minimumDuration = 0.01
  } = options || {}

  const { prefersReducedMotion } = getAccessibilityPreferences()
  
  if (respectReducedMotion && prefersReducedMotion) {
    if (fallbackToStatic) {
      // Return static variants for reduced motion
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    } else {
      // Return very fast animations
      const fastVariants: Variants = {}
      Object.keys(variants).forEach(key => {
        const variant = variants[key]
        if (typeof variant === 'object' && variant !== null && 'transition' in variant) {
          fastVariants[key] = {
            ...variant,
            transition: {
              ...variant.transition,
              duration: minimumDuration,
              ease: 'linear'
            }
          }
        } else {
          fastVariants[key] = variant
        }
      })
      return fastVariants
    }
  }
  
  return variants
}

// Create accessible animation props
export const getAccessibleAnimationProps = (
  baseProps: any,
  options?: {
    respectReducedMotion?: boolean
    staticFallback?: boolean
  }
) => {
  const { respectReducedMotion = true, staticFallback = true } = options || {}
  const { prefersReducedMotion } = getAccessibilityPreferences()

  if (respectReducedMotion && prefersReducedMotion) {
    if (staticFallback) {
      return {
        ...baseProps,
        initial: false,
        animate: false,
        transition: { duration: 0 }
      }
    } else {
      return {
        ...baseProps,
        transition: {
          ...baseProps.transition,
          duration: 0.01,
          ease: 'linear'
        }
      }
    }
  }

  return baseProps
}

// Get device-optimized animation config with performance monitoring
export const getDeviceAnimationConfig = () => {
  const deviceType = getDeviceType()
  const isLowEnd = isLowEndDevice()
  const performanceSettings = performanceOptimizer.getSettings()
  
  let baseConfig = animationConfig
  
  if (isLowEnd || deviceType === 'mobile') {
    baseConfig = {
      ...animationConfig,
      duration: animationConfig.mobile.duration,
      stagger: animationConfig.mobile.stagger,
    }
  }
  
  // Apply performance optimizations
  const durationMultiplier = performanceSettings.animationDuration
  
  return {
    ...baseConfig,
    duration: {
      fast: baseConfig.duration.fast * durationMultiplier,
      normal: baseConfig.duration.normal * durationMultiplier,
      slow: baseConfig.duration.slow * durationMultiplier,
    },
    stagger: {
      fast: performanceSettings.animationQuality === 'low' ? 0.05 : baseConfig.stagger.fast,
      normal: performanceSettings.animationQuality === 'low' ? 0.1 : baseConfig.stagger.normal,
      slow: performanceSettings.animationQuality === 'low' ? 0.15 : baseConfig.stagger.slow,
    },
    // Performance-based feature flags
    enableComplexAnimations: performanceSettings.enableComplexTransitions,
    enableParticles: performanceSettings.enableParticles,
    enableParallax: performanceSettings.enableParallax,
    maxConcurrentAnimations: performanceSettings.maxConcurrentAnimations
  }
}

/**
 * Get optimized animation variants based on performance settings
 */
export const getOptimizedAnimationVariants = (variants: Variants, componentName?: string): Variants => {
  const config = getDeviceAnimationConfig()
  const optimizedVariants: Variants = {}
  
  Object.keys(variants).forEach(key => {
    const variant = variants[key]
    if (typeof variant === 'object' && variant !== null && 'transition' in variant) {
      optimizedVariants[key] = {
        ...variant,
        transition: {
          ...variant.transition,
          duration: typeof variant.transition?.duration === 'number' 
            ? variant.transition.duration * config.duration.normal / animationConfig.duration.normal
            : variant.transition?.duration
        }
      }
    } else {
      optimizedVariants[key] = variant
    }
  })
  
  return getAnimationVariants(optimizedVariants)
}

// Touch interaction variants
export const touchInteractionVariants: Variants = {
  idle: { scale: 1 },
  pressed: { 
    scale: animationConfig.touch.tapScale,
    transition: { duration: animationConfig.touch.feedbackDuration }
  },
  released: { 
    scale: 1,
    transition: { 
      duration: animationConfig.touch.feedbackDuration,
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
}

// Mobile-optimized animation variants
export const mobileOptimizedVariants = {
  fadeIn: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: getDeviceAnimationConfig().duration.normal,
        ease: animationConfig.easing.easeOut,
      }
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: getDeviceAnimationConfig().duration.normal,
        ease: animationConfig.easing.easeOut,
      }
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: getDeviceAnimationConfig().duration.fast,
        ease: animationConfig.easing.easeOut,
      }
    },
  },
}

// Utility function to create touch-friendly minimum sizes
export const getTouchTargetSize = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizes = {
    sm: { minWidth: '36px', minHeight: '36px' },
    md: { minWidth: '44px', minHeight: '44px' }, // Apple's recommended minimum
    lg: { minWidth: '52px', minHeight: '52px' },
  }
  return sizes[size]
}