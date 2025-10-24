/**
 * Accessibility testing utilities for animations and interactive elements
 */

export interface AccessibilityTestResult {
  passed: boolean
  issues: string[]
  warnings: string[]
  suggestions: string[]
}

export interface AnimationAccessibilityCheck {
  element: HTMLElement
  respectsReducedMotion: boolean
  hasProperAriaLabels: boolean
  hasKeyboardSupport: boolean
  hasFocusManagement: boolean
  hasScreenReaderSupport: boolean
}

/**
 * Check if an element respects reduced motion preferences
 */
export function checkReducedMotionSupport(element: HTMLElement): boolean {
  if (typeof window === 'undefined') return true

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (!prefersReducedMotion) return true

  // Check computed styles for animation and transition properties
  const computedStyle = window.getComputedStyle(element)
  const animationDuration = computedStyle.animationDuration
  const transitionDuration = computedStyle.transitionDuration

  // Check if animations are disabled or very short
  const hasShortAnimations = animationDuration === '0s' || 
    animationDuration === '0.01s' || 
    parseFloat(animationDuration) <= 0.01

  const hasShortTransitions = transitionDuration === '0s' || 
    transitionDuration === '0.01s' || 
    parseFloat(transitionDuration) <= 0.01

  return hasShortAnimations && hasShortTransitions
}

/**
 * Check if an element has proper ARIA labels for accessibility
 */
export function checkAriaLabels(element: HTMLElement): AccessibilityTestResult {
  const issues: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check for aria-label or aria-labelledby
  const hasAriaLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')
  
  // Check for interactive elements without labels
  const interactiveTags = ['button', 'a', 'input', 'select', 'textarea']
  const isInteractive = interactiveTags.includes(element.tagName.toLowerCase()) || 
    element.hasAttribute('role') && ['button', 'link', 'tab'].includes(element.getAttribute('role') || '')

  if (isInteractive && !hasAriaLabel && !element.textContent?.trim()) {
    issues.push('Interactive element lacks accessible name (aria-label, aria-labelledby, or text content)')
  }

  // Check for aria-describedby for additional context
  if (element.hasAttribute('aria-describedby')) {
    const describedById = element.getAttribute('aria-describedby')
    const describedByElement = document.getElementById(describedById || '')
    if (!describedByElement) {
      issues.push(`aria-describedby references non-existent element: ${describedById}`)
    }
  }

  // Check for proper role usage
  const role = element.getAttribute('role')
  if (role) {
    const validRoles = [
      'button', 'link', 'tab', 'tabpanel', 'dialog', 'alert', 'status',
      'region', 'navigation', 'main', 'banner', 'contentinfo', 'complementary'
    ]
    if (!validRoles.includes(role)) {
      warnings.push(`Uncommon or potentially invalid role: ${role}`)
    }
  }

  // Suggestions for improvement
  if (element.hasAttribute('title') && !hasAriaLabel) {
    suggestions.push('Consider using aria-label instead of title for better screen reader support')
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
    suggestions
  }
}

/**
 * Check keyboard navigation support
 */
export function checkKeyboardSupport(element: HTMLElement): AccessibilityTestResult {
  const issues: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check if interactive elements are focusable
  const isInteractive = element.matches('button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"]')
  
  if (isInteractive) {
    const tabIndex = element.getAttribute('tabindex')
    const isNaturallyFocusable = element.matches('button, a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
    
    if (!isNaturallyFocusable && tabIndex !== '0') {
      issues.push('Interactive element is not keyboard focusable (missing tabindex="0")')
    }

    if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
      warnings.push('Element has tabindex="-1" but is not aria-hidden, may confuse keyboard users')
    }
  }

  // Check for keyboard event handlers
  const hasKeyboardHandlers = element.hasAttribute('onkeydown') || 
    element.hasAttribute('onkeyup') || 
    element.hasAttribute('onkeypress')

  const hasClickHandler = element.hasAttribute('onclick') || element.onclick !== null

  if (hasClickHandler && !hasKeyboardHandlers && isInteractive) {
    suggestions.push('Consider adding keyboard event handlers for better accessibility')
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
    suggestions
  }
}

/**
 * Check focus management for dynamic content
 */
export function checkFocusManagement(container: HTMLElement): AccessibilityTestResult {
  const issues: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check for focus trapping in modals/dialogs
  if (container.getAttribute('role') === 'dialog' || container.classList.contains('modal')) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) {
      issues.push('Modal/dialog contains no focusable elements')
    } else {
      // Check if first element receives focus
      const firstFocusable = focusableElements[0] as HTMLElement
      if (document.activeElement !== firstFocusable) {
        warnings.push('First focusable element in modal should receive focus when opened')
      }
    }
  }

  // Check for skip links
  const skipLinks = container.querySelectorAll('.skip-link, [href^="#"]')
  if (skipLinks.length === 0 && container === document.body) {
    suggestions.push('Consider adding skip links for better keyboard navigation')
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
    suggestions
  }
}

/**
 * Comprehensive accessibility audit for animated elements
 */
export function auditAnimatedElement(element: HTMLElement): AnimationAccessibilityCheck {
  const respectsReducedMotion = checkReducedMotionSupport(element)
  const ariaResult = checkAriaLabels(element)
  const keyboardResult = checkKeyboardSupport(element)
  const focusResult = checkFocusManagement(element)

  return {
    element,
    respectsReducedMotion,
    hasProperAriaLabels: ariaResult.passed,
    hasKeyboardSupport: keyboardResult.passed,
    hasFocusManagement: focusResult.passed,
    hasScreenReaderSupport: ariaResult.passed && (
      element.hasAttribute('aria-live') || 
      element.hasAttribute('aria-atomic') ||
      element.hasAttribute('role')
    )
  }
}

/**
 * Test animation performance and accessibility
 */
export function testAnimationPerformance(element: HTMLElement): {
  frameRate: number
  droppedFrames: number
  memoryUsage: number
  accessibilityScore: number
} {
  const frameCount = 0
  const droppedFrames = 0
  const lastTime = performance.now()
  const startTime = lastTime

  const audit = auditAnimatedElement(element)
  
  // Calculate accessibility score (0-100)
  let accessibilityScore = 0
  if (audit.respectsReducedMotion) accessibilityScore += 25
  if (audit.hasProperAriaLabels) accessibilityScore += 25
  if (audit.hasKeyboardSupport) accessibilityScore += 25
  if (audit.hasScreenReaderSupport) accessibilityScore += 25

  // Mock performance metrics (in a real implementation, you'd measure actual performance)
  const frameRate = 60 // Assume 60fps for now
  const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

  return {
    frameRate,
    droppedFrames,
    memoryUsage,
    accessibilityScore
  }
}

/**
 * Generate accessibility report for a container
 */
export function generateAccessibilityReport(container: HTMLElement): {
  summary: {
    totalElements: number
    passedElements: number
    failedElements: number
    overallScore: number
  }
  details: Array<{
    element: HTMLElement
    tagName: string
    issues: string[]
    warnings: string[]
    suggestions: string[]
  }>
} {
  const animatedElements = container.querySelectorAll('[class*="animate"], [style*="animation"], [style*="transition"]')
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')
  
  const allElements = new Set([...animatedElements, ...interactiveElements])
  const details: Array<{
    element: HTMLElement
    tagName: string
    issues: string[]
    warnings: string[]
    suggestions: string[]
  }> = []

  let passedElements = 0
  let totalIssues = 0

  allElements.forEach(element => {
    const htmlElement = element as HTMLElement
    const ariaResult = checkAriaLabels(htmlElement)
    const keyboardResult = checkKeyboardSupport(htmlElement)
    const focusResult = checkFocusManagement(htmlElement)

    const allIssues = [...ariaResult.issues, ...keyboardResult.issues, ...focusResult.issues]
    const allWarnings = [...ariaResult.warnings, ...keyboardResult.warnings, ...focusResult.warnings]
    const allSuggestions = [...ariaResult.suggestions, ...keyboardResult.suggestions, ...focusResult.suggestions]

    if (allIssues.length === 0) {
      passedElements++
    }

    totalIssues += allIssues.length

    details.push({
      element: htmlElement,
      tagName: htmlElement.tagName.toLowerCase(),
      issues: allIssues,
      warnings: allWarnings,
      suggestions: allSuggestions
    })
  })

  const overallScore = allElements.size > 0 ? Math.round((passedElements / allElements.size) * 100) : 100

  return {
    summary: {
      totalElements: allElements.size,
      passedElements,
      failedElements: allElements.size - passedElements,
      overallScore
    },
    details
  }
}

/**
 * Utility to announce changes to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement)
    }
  }, 1000)
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get accessibility-friendly animation duration
 */
export function getAccessibleDuration(baseDuration: number): number {
  return prefersReducedMotion() ? 0.01 : baseDuration
}

/**
 * Create accessible focus trap for modals
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>

  if (focusableElements.length === 0) return () => {}

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

  // Focus first element
  firstElement.focus()

  container.addEventListener('keydown', handleTabKey)

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}