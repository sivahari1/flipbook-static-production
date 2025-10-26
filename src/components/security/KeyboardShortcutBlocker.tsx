'use client'

import { useEffect, useRef, useCallback } from 'react'
import { SecurityViolation } from '@/lib/drm-protection'

interface KeyboardShortcutBlockerProps {
  enabled?: boolean
  onViolation?: (violation: SecurityViolation) => void
  strictMode?: boolean
  allowedKeys?: string[]
  customBlocks?: Array<{
    key: string
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
    description: string
  }>
}

interface BlockedShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  severity: SecurityViolation['severity']
  violationType: SecurityViolation['type']
}

export function KeyboardShortcutBlocker({
  enabled = true,
  onViolation,
  strictMode = true,
  allowedKeys = [],
  customBlocks = []
}: KeyboardShortcutBlockerProps) {
  const isActiveRef = useRef(false)

  // Define blocked shortcuts with enhanced coverage
  const blockedShortcuts: BlockedShortcut[] = [
    // Copy/Paste/Cut operations
    { key: 'c', ctrl: true, description: 'Copy (Ctrl+C)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'v', ctrl: true, description: 'Paste (Ctrl+V)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'x', ctrl: true, description: 'Cut (Ctrl+X)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'a', ctrl: true, description: 'Select All (Ctrl+A)', severity: 'medium', violationType: 'copy_attempt' },
    
    // Save operations
    { key: 's', ctrl: true, description: 'Save (Ctrl+S)', severity: 'high', violationType: 'save_attempt' },
    { key: 's', ctrl: true, shift: true, description: 'Save As (Ctrl+Shift+S)', severity: 'high', violationType: 'save_attempt' },
    
    // Print operations
    { key: 'p', ctrl: true, description: 'Print (Ctrl+P)', severity: 'high', violationType: 'print_attempt' },
    
    // Developer tools
    { key: 'F12', description: 'Developer Tools (F12)', severity: 'critical', violationType: 'devtools_opened' },
    { key: 'i', ctrl: true, shift: true, description: 'Developer Tools (Ctrl+Shift+I)', severity: 'critical', violationType: 'devtools_opened' },
    { key: 'j', ctrl: true, shift: true, description: 'Console (Ctrl+Shift+J)', severity: 'critical', violationType: 'devtools_opened' },
    { key: 'c', ctrl: true, shift: true, description: 'Inspect Element (Ctrl+Shift+C)', severity: 'critical', violationType: 'devtools_opened' },
    { key: 'k', ctrl: true, shift: true, description: 'Console (Ctrl+Shift+K)', severity: 'critical', violationType: 'devtools_opened' },
    
    // View source and page info
    { key: 'u', ctrl: true, description: 'View Source (Ctrl+U)', severity: 'high', violationType: 'copy_attempt' },
    { key: 'i', ctrl: true, description: 'Page Info (Ctrl+I)', severity: 'medium', violationType: 'unauthorized_access' },
    
    // Browser functions
    { key: 'h', ctrl: true, description: 'History (Ctrl+H)', severity: 'low', violationType: 'unauthorized_access' },
    { key: 'j', ctrl: true, description: 'Downloads (Ctrl+J)', severity: 'medium', violationType: 'unauthorized_access' },
    { key: 'd', ctrl: true, description: 'Bookmark (Ctrl+D)', severity: 'low', violationType: 'unauthorized_access' },
    { key: 'f', ctrl: true, description: 'Find (Ctrl+F)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'g', ctrl: true, description: 'Find Next (Ctrl+G)', severity: 'medium', violationType: 'copy_attempt' },
    
    // Screenshot shortcuts
    { key: 'PrintScreen', description: 'Print Screen', severity: 'critical', violationType: 'screenshot_attempt' },
    { key: 'PrintScreen', alt: true, description: 'Alt+Print Screen', severity: 'critical', violationType: 'screenshot_attempt' },
    { key: 'PrintScreen', ctrl: true, description: 'Ctrl+Print Screen', severity: 'critical', violationType: 'screenshot_attempt' },
    
    // Function keys (commonly used for dev tools)
    { key: 'F1', description: 'Help (F1)', severity: 'low', violationType: 'unauthorized_access' },
    { key: 'F3', description: 'Find (F3)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'F5', description: 'Refresh (F5)', severity: 'low', violationType: 'unauthorized_access' },
    { key: 'F6', description: 'Address Bar (F6)', severity: 'low', violationType: 'unauthorized_access' },
    { key: 'F11', description: 'Fullscreen (F11)', severity: 'low', violationType: 'unauthorized_access' },
    
    // Mac shortcuts (Cmd instead of Ctrl)
    { key: 'c', meta: true, description: 'Copy (Cmd+C)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'v', meta: true, description: 'Paste (Cmd+V)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'x', meta: true, description: 'Cut (Cmd+X)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 'a', meta: true, description: 'Select All (Cmd+A)', severity: 'medium', violationType: 'copy_attempt' },
    { key: 's', meta: true, description: 'Save (Cmd+S)', severity: 'high', violationType: 'save_attempt' },
    { key: 'p', meta: true, description: 'Print (Cmd+P)', severity: 'high', violationType: 'print_attempt' },
    { key: 'i', meta: true, shift: true, description: 'Developer Tools (Cmd+Shift+I)', severity: 'critical', violationType: 'devtools_opened' },
    { key: 'j', meta: true, shift: true, description: 'Console (Cmd+Shift+J)', severity: 'critical', violationType: 'devtools_opened' },
    { key: 'c', meta: true, shift: true, description: 'Inspect Element (Cmd+Shift+C)', severity: 'critical', violationType: 'devtools_opened' },
    
    // Windows-specific shortcuts
    { key: 'PrintScreen', meta: true, description: 'Windows+Print Screen', severity: 'critical', violationType: 'screenshot_attempt' },
    { key: 's', meta: true, shift: true, description: 'Windows+Shift+S (Snipping Tool)', severity: 'critical', violationType: 'screenshot_attempt' },
    
    // Additional security shortcuts
    { key: 'Escape', description: 'Escape', severity: 'low', violationType: 'unauthorized_access' },
    { key: 'Tab', alt: true, description: 'Alt+Tab (Switch Apps)', severity: 'medium', violationType: 'screenshot_attempt' },
    
    // Custom blocks from props
    ...customBlocks.map(block => ({
      ...block,
      severity: 'medium' as const,
      violationType: 'copy_attempt' as const
    }))
  ]

  const recordViolation = useCallback((violation: Omit<SecurityViolation, 'timestamp' | 'userAgent' | 'url'>) => {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    onViolation?.(fullViolation)
    
    // Log to console for debugging
    console.warn('🚨 Keyboard Shortcut Blocked:', fullViolation)
  }, [onViolation])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !isActiveRef.current) return

    const key = event.key
    const ctrl = event.ctrlKey
    const alt = event.altKey
    const shift = event.shiftKey
    const meta = event.metaKey

    // Check if key is in allowed list
    if (allowedKeys.includes(key.toLowerCase())) {
      return
    }

    // Find matching blocked shortcut
    const blockedShortcut = blockedShortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? ctrl || meta : !ctrl && !meta
      const altMatch = shortcut.alt ? alt : !alt
      const shiftMatch = shortcut.shift ? shift : !shift
      const metaMatch = shortcut.meta ? meta : !meta

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
    })

    if (blockedShortcut) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      recordViolation({
        type: blockedShortcut.violationType,
        details: `Blocked keyboard shortcut: ${blockedShortcut.description}`,
        severity: blockedShortcut.severity
      })

      return false
    }

    // In strict mode, block additional potentially dangerous keys
    if (strictMode) {
      const strictBlocks = [
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
        'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'
      ]

      if (strictBlocks.includes(key)) {
        event.preventDefault()
        event.stopPropagation()

        recordViolation({
          type: 'unauthorized_access',
          details: `Blocked function key in strict mode: ${key}`,
          severity: 'low'
        })

        return false
      }
    }
  }, [enabled, strictMode, allowedKeys, blockedShortcuts, recordViolation])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled || !isActiveRef.current) return

    // Additional detection for key combinations that might be missed on keydown
    if (event.key === 'PrintScreen') {
      recordViolation({
        type: 'screenshot_attempt',
        details: 'Print Screen key detected on keyup',
        severity: 'critical'
      })
    }
  }, [enabled, recordViolation])

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled || !isActiveRef.current) return

    // Block any remaining key press events for blocked shortcuts
    const key = event.key
    const isBlocked = blockedShortcuts.some(shortcut => 
      shortcut.key.toLowerCase() === key.toLowerCase() &&
      (!shortcut.ctrl || event.ctrlKey || event.metaKey) &&
      (!shortcut.alt || event.altKey) &&
      (!shortcut.shift || event.shiftKey) &&
      (!shortcut.meta || event.metaKey)
    )

    if (isBlocked) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }, [enabled, blockedShortcuts])

  useEffect(() => {
    if (!enabled) return

    isActiveRef.current = true

    // Add event listeners with capture to catch events early
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })
    document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false })
    document.addEventListener('keypress', handleKeyPress, { capture: true, passive: false })

    // Also add to window for additional coverage
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })
    window.addEventListener('keyup', handleKeyUp, { capture: true, passive: false })

    console.log('🔒 Keyboard Shortcut Blocker activated')

    return () => {
      isActiveRef.current = false
      
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('keyup', handleKeyUp, { capture: true })
      document.removeEventListener('keypress', handleKeyPress, { capture: true })
      
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })

      console.log('🔓 Keyboard Shortcut Blocker deactivated')
    }
  }, [enabled, handleKeyDown, handleKeyUp, handleKeyPress])

  // Return null as this is a behavior-only component
  return null
}

export default KeyboardShortcutBlocker