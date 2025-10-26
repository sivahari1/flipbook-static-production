'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { DRMProtection as DRMProtectionClass, SecurityViolation } from '@/lib/drm-protection'
import KeyboardShortcutBlocker from './KeyboardShortcutBlocker'

interface DRMProtectionProps {
  children: ReactNode
  enabled?: boolean
  onViolation?: (violation: SecurityViolation) => void
  showWarnings?: boolean
  strictMode?: boolean
  className?: string
  allowedKeys?: string[]
  customKeyboardBlocks?: Array<{
    key: string
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
    description: string
  }>
}

export function DRMProtection({
  children,
  enabled = true,
  onViolation,
  showWarnings = true,
  strictMode = true,
  className = '',
  allowedKeys = [],
  customKeyboardBlocks = []
}: DRMProtectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const drmRef = useRef<DRMProtectionClass | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [violations, setViolations] = useState<SecurityViolation[]>([])

  useEffect(() => {
    if (!enabled) return

    // Initialize DRM protection
    const handleViolation = (violation: SecurityViolation) => {
      setViolations(prev => [...prev, violation])
      onViolation?.(violation)
      
      // Log violation to server
      logSecurityViolation(violation)
      
      if (showWarnings) {
        showViolationWarning(violation)
      }
    }

    drmRef.current = new DRMProtectionClass(handleViolation)
    drmRef.current.activate()
    setIsActive(true)

    // Add additional protection to the container
    if (containerRef.current) {
      applyContainerProtection(containerRef.current)
    }

    return () => {
      if (drmRef.current) {
        drmRef.current.deactivate()
        setIsActive(false)
      }
    }
  }, [enabled, onViolation, showWarnings])

  const applyContainerProtection = (container: HTMLElement) => {
    // Prevent context menu on container
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Prevent drag operations
    const handleDragStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Prevent drop operations
    const handleDrop = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    container.addEventListener('contextmenu', handleContextMenu, true)
    container.addEventListener('selectstart', handleSelectStart, true)
    container.addEventListener('dragstart', handleDragStart, true)
    container.addEventListener('drop', handleDrop, true)

    // Apply CSS protection
    const style = container.style as any
    style.userSelect = 'none'
    style.webkitUserSelect = 'none'
    style.mozUserSelect = 'none'
    style.msUserSelect = 'none'
    style.webkitTouchCallout = 'none'
    style.webkitTapHighlightColor = 'transparent'

    // Prevent dragging
    style.webkitUserDrag = 'none'
    style.khtmlUserDrag = 'none'
    style.mozUserDrag = 'none'
    style.oUserDrag = 'none'
    style.userDrag = 'none'

    // Store cleanup function
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu, true)
      container.removeEventListener('selectstart', handleSelectStart, true)
      container.removeEventListener('dragstart', handleDragStart, true)
      container.removeEventListener('drop', handleDrop, true)
    }
  }

  const logSecurityViolation = async (violation: SecurityViolation) => {
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

  const showViolationWarning = (violation: SecurityViolation) => {
    // Only show warnings for medium/high/critical violations
    if (violation.severity === 'low') return

    const warningDiv = document.createElement('div')
    warningDiv.className = 'drm-security-warning'
    warningDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 320px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `

    const severityIcon = {
      low: '⚠️',
      medium: '🚨',
      high: '🔒',
      critical: '🛡️'
    }[violation.severity]

    warningDiv.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 18px; margin-right: 8px;">${severityIcon}</span>
        <span style="font-weight: 600;">Security Violation Detected</span>
      </div>
      <div style="margin-bottom: 8px; line-height: 1.4;">${violation.details}</div>
      <div style="font-size: 12px; opacity: 0.9; font-style: italic;">
        This action has been logged and reported.
      </div>
    `

    document.body.appendChild(warningDiv)

    // Add animation styles if not already present
    if (!document.querySelector('#drm-warning-styles')) {
      const style = document.createElement('style')
      style.id = 'drm-warning-styles'
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }

    // Auto-remove warning after 5 seconds
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        setTimeout(() => {
          if (warningDiv.parentNode) {
            warningDiv.parentNode.removeChild(warningDiv)
          }
        }, 300)
      }
    }, 5000)

    // Allow manual dismissal
    warningDiv.addEventListener('click', () => {
      if (warningDiv.parentNode) {
        warningDiv.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        setTimeout(() => {
          if (warningDiv.parentNode) {
            warningDiv.parentNode.removeChild(warningDiv)
          }
        }, 300)
      }
    })
  }

  const getSessionId = (): string => {
    // Try to get session ID from various sources
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('drm-session-id') || 
             localStorage.getItem('session-id') || 
             'anonymous-' + Date.now()
    }
    return 'server-session'
  }

  const getViolationCount = () => violations.length

  const clearViolations = () => {
    setViolations([])
    if (drmRef.current) {
      drmRef.current.clearViolations()
    }
  }

  // Expose methods for parent components
  const drmMethods = {
    getViolations: () => violations,
    getViolationCount,
    clearViolations,
    isActive,
    deactivate: () => {
      if (drmRef.current) {
        drmRef.current.deactivate()
        setIsActive(false)
      }
    },
    activate: () => {
      if (drmRef.current) {
        drmRef.current.activate()
        setIsActive(true)
      }
    }
  }

  return (
    <>
      {/* Enhanced Keyboard Shortcut Blocker */}
      <KeyboardShortcutBlocker
        enabled={enabled}
        onViolation={onViolation}
        strictMode={strictMode}
        allowedKeys={allowedKeys}
        customBlocks={customKeyboardBlocks}
      />
      
      <div
        ref={containerRef}
        className={`drm-protected-container ${className}`}
        data-drm-active={isActive}
        data-violation-count={violations.length}
        style={{
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* DRM Status Indicator (only visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs px-2 py-1 rounded">
            🔒 DRM: {isActive ? 'Active' : 'Inactive'} | Violations: {violations.length}
          </div>
        )}

        {/* Protected Content */}
        <div className="drm-content-wrapper">
          {children}
        </div>

        {/* Invisible overlay for additional protection */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.001) 50%, transparent 51%)',
            backgroundSize: '20px 20px',
            zIndex: 1
          }}
        />

        {/* Screenshot detection overlay */}
        <div 
          className="screenshot-detector absolute inset-0 pointer-events-none opacity-0"
          style={{ zIndex: -1 }}
        />
      </div>
    </>
  )
}

// Export the methods for external use
export type DRMProtectionRef = {
  getViolations: () => SecurityViolation[]
  getViolationCount: () => number
  clearViolations: () => void
  isActive: boolean
  deactivate: () => void
  activate: () => void
}