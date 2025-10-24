'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAccessibility } from '@/hooks/useAccessibility'

interface AccessibilityContextType {
  preferences: {
    prefersReducedMotion: boolean
    prefersHighContrast: boolean
    prefersReducedTransparency: boolean
    prefersColorScheme: 'light' | 'dark' | 'no-preference'
  }
  config: {
    enableAnimations: boolean
    animationDuration: number
    enableParallax: boolean
    enableAutoplay: boolean
    enableTransitions: boolean
    focusRingVisible: boolean
  }
  announceToScreenReader: (message: string) => void
  focusElement: (selector: string) => void
  trapFocus: (containerSelector: string) => (() => void) | undefined
  checkPreferences: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useAccessibility()

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider')
  }
  return context
}

// Higher-order component for accessibility-aware components
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AccessibilityAwareComponent(props: P) {
    const accessibility = useAccessibilityContext()
    
    return (
      <Component 
        {...props} 
        accessibility={accessibility}
      />
    )
  }
}