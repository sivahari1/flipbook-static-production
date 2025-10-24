'use client'

import { useEffect, useState, useCallback } from 'react'

interface AccessibilityPreferences {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersReducedTransparency: boolean
  prefersColorScheme: 'light' | 'dark' | 'no-preference'
}

interface AccessibilityConfig {
  enableAnimations: boolean
  animationDuration: number
  enableParallax: boolean
  enableAutoplay: boolean
  enableTransitions: boolean
  focusRingVisible: boolean
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersReducedTransparency: false,
    prefersColorScheme: 'no-preference'
  })

  const [config, setConfig] = useState<AccessibilityConfig>({
    enableAnimations: true,
    animationDuration: 1,
    enableParallax: true,
    enableAutoplay: true,
    enableTransitions: true,
    focusRingVisible: true
  })

  // Check media queries for accessibility preferences
  const checkPreferences = useCallback(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 
                              window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'no-preference'

    setPreferences({
      prefersReducedMotion,
      prefersHighContrast,
      prefersReducedTransparency,
      prefersColorScheme: prefersColorScheme as 'light' | 'dark' | 'no-preference'
    })

    // Update config based on preferences
    setConfig(prev => ({
      ...prev,
      enableAnimations: !prefersReducedMotion,
      animationDuration: prefersReducedMotion ? 0.01 : 1, // Nearly instant for reduced motion
      enableParallax: !prefersReducedMotion,
      enableAutoplay: !prefersReducedMotion,
      enableTransitions: !prefersReducedMotion
    }))
  }, [])

  useEffect(() => {
    checkPreferences()

    // Listen for changes in accessibility preferences
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-transparency: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)')
    ]

    const handleChange = () => checkPreferences()

    mediaQueries.forEach(mq => {
      if (mq.addEventListener) {
        mq.addEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mq.addListener(handleChange)
      }
    })

    return () => {
      mediaQueries.forEach(mq => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handleChange)
        } else {
          // Fallback for older browsers
          mq.removeListener(handleChange)
        }
      })
    }
  }, [checkPreferences])

  // Announce changes to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    if (typeof window === 'undefined') return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  // Focus management utilities
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      // Ensure focus is visible
      element.style.outline = config.focusRingVisible ? '2px solid #3B82F6' : 'none'
    }
  }, [config.focusRingVisible])

  const trapFocus = useCallback((containerSelector: string) => {
    const container = document.querySelector(containerSelector) as HTMLElement
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  return {
    preferences,
    config,
    announceToScreenReader,
    focusElement,
    trapFocus,
    checkPreferences
  }
}

// Utility function to get accessible animation props
export function getAccessibleAnimationProps(config: AccessibilityConfig) {
  return {
    animate: config.enableAnimations,
    transition: {
      duration: config.enableAnimations ? undefined : 0.01,
      ease: config.enableAnimations ? undefined : 'linear'
    },
    initial: config.enableAnimations ? undefined : false
  }
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return { isKeyboardUser }
}