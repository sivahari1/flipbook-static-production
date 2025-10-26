'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { DRMProtection, SecurityViolation } from '@/lib/drm-protection'

interface UseDRMProtectionOptions {
  enabled?: boolean
  onViolation?: (violation: SecurityViolation) => void
  autoActivate?: boolean
  logViolations?: boolean
  showWarnings?: boolean
}

interface DRMProtectionState {
  isActive: boolean
  violations: SecurityViolation[]
  violationCount: number
  lastViolation: SecurityViolation | null
}

export function useDRMProtection(options: UseDRMProtectionOptions = {}) {
  const {
    enabled = true,
    onViolation,
    autoActivate = true,
    logViolations = true,
    showWarnings = true
  } = options

  const drmRef = useRef<DRMProtection | null>(null)
  const [state, setState] = useState<DRMProtectionState>({
    isActive: false,
    violations: [],
    violationCount: 0,
    lastViolation: null
  })

  const handleViolation = useCallback(async (violation: SecurityViolation) => {
    setState(prev => ({
      ...prev,
      violations: [...prev.violations, violation],
      violationCount: prev.violationCount + 1,
      lastViolation: violation
    }))

    // Call external handler
    onViolation?.(violation)

    // Log to server if enabled
    if (logViolations) {
      try {
        await fetch('/api/security/violation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: violation.type,
            details: violation.details,
            severity: violation.severity,
            timestamp: violation.timestamp.toISOString(),
            userAgent: violation.userAgent,
            url: violation.url,
            sessionId: getSessionId(),
          }),
        })
      } catch (error) {
        console.error('Failed to log security violation:', error)
      }
    }

    // Show warning if enabled
    if (showWarnings && violation.severity !== 'low') {
      showViolationNotification(violation)
    }
  }, [onViolation, logViolations, showWarnings])

  const activate = useCallback(() => {
    if (!enabled || drmRef.current?.isActive) return

    if (!drmRef.current) {
      drmRef.current = new DRMProtection(handleViolation)
    }

    drmRef.current.activate()
    setState(prev => ({ ...prev, isActive: true }))
    
    console.log('🔒 DRM Protection activated via hook')
  }, [enabled, handleViolation])

  const deactivate = useCallback(() => {
    if (!drmRef.current?.isActive) return

    drmRef.current.deactivate()
    setState(prev => ({ ...prev, isActive: false }))
    
    console.log('🔓 DRM Protection deactivated via hook')
  }, [])

  const clearViolations = useCallback(() => {
    setState(prev => ({
      ...prev,
      violations: [],
      violationCount: 0,
      lastViolation: null
    }))
    
    if (drmRef.current) {
      drmRef.current.clearViolations()
    }
  }, [])

  const getViolationsByType = useCallback((type: SecurityViolation['type']) => {
    return state.violations.filter(v => v.type === type)
  }, [state.violations])

  const getViolationsBySeverity = useCallback((severity: SecurityViolation['severity']) => {
    return state.violations.filter(v => v.severity === severity)
  }, [state.violations])

  const getRecentViolations = useCallback((minutes: number = 5) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return state.violations.filter(v => v.timestamp > cutoff)
  }, [state.violations])

  // Auto-activate on mount if enabled
  useEffect(() => {
    if (enabled && autoActivate) {
      activate()
    }

    return () => {
      if (drmRef.current) {
        drmRef.current.deactivate()
      }
    }
  }, [enabled, autoActivate, activate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (drmRef.current) {
        drmRef.current.deactivate()
      }
    }
  }, [])

  return {
    // State
    ...state,
    
    // Actions
    activate,
    deactivate,
    clearViolations,
    
    // Queries
    getViolationsByType,
    getViolationsBySeverity,
    getRecentViolations,
    
    // Utilities
    isEnabled: enabled,
    hasViolations: state.violationCount > 0,
    hasRecentViolations: getRecentViolations().length > 0,
    hasCriticalViolations: getViolationsBySeverity('critical').length > 0,
    
    // Raw DRM instance (for advanced usage)
    drmInstance: drmRef.current
  }
}

// Helper functions
function getSessionId(): string {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('drm-session-id') || 
           localStorage.getItem('session-id') || 
           'anonymous-' + Date.now()
  }
  return 'server-session'
}

function showViolationNotification(violation: SecurityViolation) {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = 'drm-violation-notification'
  
  const severityColors = {
    low: '#f59e0b',
    medium: '#ef4444',
    high: '#dc2626',
    critical: '#991b1b'
  }
  
  const severityIcons = {
    low: '⚠️',
    medium: '🚨',
    high: '🔒',
    critical: '🛡️'
  }

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, ${severityColors[violation.severity]}, ${severityColors[violation.severity]}dd);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 320px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  `

  notification.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 18px; margin-right: 8px;">${severityIcons[violation.severity]}</span>
      <span style="font-weight: 600;">Security Alert</span>
    </div>
    <div style="margin-bottom: 8px; line-height: 1.4;">${violation.details}</div>
    <div style="font-size: 12px; opacity: 0.9; font-style: italic;">
      Click to dismiss • ${violation.timestamp.toLocaleTimeString()}
    </div>
  `

  // Add to DOM
  document.body.appendChild(notification)

  // Auto-remove after 5 seconds
  const removeNotification = () => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }
  }

  // Remove on click
  notification.addEventListener('click', removeNotification)
  
  // Auto-remove
  setTimeout(removeNotification, 5000)

  // Add CSS animations if not present
  if (!document.querySelector('#drm-notification-styles')) {
    const style = document.createElement('style')
    style.id = 'drm-notification-styles'
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }
}

export type { SecurityViolation, DRMProtectionState }