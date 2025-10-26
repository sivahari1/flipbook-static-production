// Enhanced DRM Protection System
export interface SecurityViolation {
  type: 'screenshot_attempt' | 'devtools_opened' | 'copy_attempt' | 'print_attempt' | 'save_attempt' | 'unauthorized_access'
  timestamp: Date
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userAgent: string
  url: string
}

export class DRMProtection {
  private violations: SecurityViolation[] = []
  private onViolation?: (violation: SecurityViolation) => void
  private screenshotDetectionInterval?: NodeJS.Timeout
  private devToolsDetectionInterval?: NodeJS.Timeout
  public isActive = false

  constructor(onViolation?: (violation: SecurityViolation) => void) {
    this.onViolation = onViolation
  }

  activate() {
    if (this.isActive) return
    this.isActive = true

    // Disable right-click context menu
    this.disableContextMenu()
    
    // Disable text selection
    this.disableTextSelection()
    
    // Block keyboard shortcuts
    this.blockKeyboardShortcuts()
    
    // Prevent drag and drop
    this.preventDragDrop()
    
    // Detect developer tools
    this.detectDevTools()
    
    // Detect screenshot attempts
    this.detectScreenshots()
    
    // Prevent printing
    this.preventPrinting()
    
    // Prevent saving
    this.preventSaving()
    
    // Monitor focus changes
    this.monitorFocusChanges()
    
    // Disable F12 and other dev shortcuts
    this.disableDevShortcuts()

    console.log('🔒 DRM Protection activated')
  }

  deactivate() {
    if (!this.isActive) return
    this.isActive = false

    if (this.screenshotDetectionInterval) {
      clearInterval(this.screenshotDetectionInterval)
    }
    if (this.devToolsDetectionInterval) {
      clearInterval(this.devToolsDetectionInterval)
    }

    // Remove event listeners
    document.removeEventListener('contextmenu', this.handleContextMenu)
    document.removeEventListener('selectstart', this.handleSelectStart)
    document.removeEventListener('keydown', this.handleKeyDown, { capture: true })
    document.removeEventListener('keyup', this.handleKeyUp, { capture: true })
    document.removeEventListener('dragstart', this.handleDragStart)
    document.removeEventListener('drop', this.handleDrop)
    window.removeEventListener('beforeprint', this.handleBeforePrint)
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true })
    window.removeEventListener('keydown', this.handleWindowKeyDown)

    console.log('🔓 DRM Protection deactivated')
  }

  private recordViolation(violation: Omit<SecurityViolation, 'timestamp' | 'userAgent' | 'url'>) {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    this.violations.push(fullViolation)
    this.onViolation?.(fullViolation)

    // Log to console for debugging
    console.warn('🚨 Security Violation:', fullViolation)

    // Show user warning for high/critical violations
    if (fullViolation.severity === 'high' || fullViolation.severity === 'critical') {
      this.showSecurityWarning(fullViolation)
    }
  }

  private showSecurityWarning(violation: SecurityViolation) {
    const warningDiv = document.createElement('div')
    warningDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `
    warningDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">🚨 Security Violation Detected</div>
      <div style="margin-bottom: 8px;">${violation.details}</div>
      <div style="font-size: 12px; opacity: 0.9;">This action has been logged and reported.</div>
    `

    document.body.appendChild(warningDiv)

    // Remove warning after 5 seconds
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv)
      }
    }, 5000)
  }

  private disableContextMenu() {
    this.handleContextMenu = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      this.recordViolation({
        type: 'copy_attempt',
        details: 'Right-click context menu blocked',
        severity: 'low'
      })
      return false
    }
    document.addEventListener('contextmenu', this.handleContextMenu, true)
  }

  private disableTextSelection() {
    this.handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }
    document.addEventListener('selectstart', this.handleSelectStart, true)

    // Add CSS to prevent selection
    const style = document.createElement('style')
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    `
    document.head.appendChild(style)
  }

  private blockKeyboardShortcuts() {
    this.handleKeyDown = (e: KeyboardEvent) => {
      const blockedKeys = [
        'F12', 'F11', 'F10', 'F9', 'F8', 'F7', 'F6', 'F5', 'F4', 'F3', 'F2', 'F1',
        'PrintScreen', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'
      ]

      const blockedCombos = [
        // Copy/Paste/Cut operations
        { ctrl: true, key: 'c' }, // Copy
        { ctrl: true, key: 'v' }, // Paste
        { ctrl: true, key: 'x' }, // Cut
        { ctrl: true, key: 'a' }, // Select all
        
        // Save operations
        { ctrl: true, key: 's' }, // Save
        { ctrl: true, shift: true, key: 's' }, // Save as
        
        // Print operations
        { ctrl: true, key: 'p' }, // Print
        
        // Developer tools - Enhanced coverage
        { ctrl: true, shift: true, key: 'i' }, // Dev tools
        { ctrl: true, shift: true, key: 'j' }, // Console
        { ctrl: true, shift: true, key: 'c' }, // Inspect
        { ctrl: true, shift: true, key: 'k' }, // Console (Firefox)
        { ctrl: true, shift: true, key: 'e' }, // Network tab
        { ctrl: true, shift: true, key: 'm' }, // Mobile view
        { ctrl: true, shift: true, key: 'p' }, // Command palette
        
        // View source and page info
        { ctrl: true, key: 'u' }, // View source
        { ctrl: true, key: 'i' }, // Page info
        
        // Browser functions
        { ctrl: true, key: 'h' }, // History
        { ctrl: true, key: 'j' }, // Downloads
        { ctrl: true, key: 'd' }, // Bookmark
        { ctrl: true, key: 'f' }, // Find
        { ctrl: true, key: 'g' }, // Find next
        { ctrl: true, key: 'r' }, // Refresh
        { ctrl: true, key: 'w' }, // Close tab
        { ctrl: true, key: 't' }, // New tab
        { ctrl: true, key: 'n' }, // New window
        { ctrl: true, key: 'l' }, // Address bar
        { ctrl: true, key: 'k' }, // Search bar
        
        // Screenshot shortcuts - Enhanced
        { alt: true, key: 'PrintScreen' }, // Alt + Print Screen
        { ctrl: true, key: 'PrintScreen' }, // Ctrl + Print Screen
        { shift: true, key: 'PrintScreen' }, // Shift + Print Screen
        
        // Mac shortcuts (Cmd instead of Ctrl)
        { cmd: true, key: 'c' }, // Mac copy
        { cmd: true, key: 'v' }, // Mac paste
        { cmd: true, key: 'x' }, // Mac cut
        { cmd: true, key: 'a' }, // Mac select all
        { cmd: true, key: 's' }, // Mac save
        { cmd: true, key: 'p' }, // Mac print
        { cmd: true, key: 'f' }, // Mac find
        { cmd: true, key: 'r' }, // Mac refresh
        { cmd: true, key: 'w' }, // Mac close tab
        { cmd: true, key: 't' }, // Mac new tab
        { cmd: true, key: 'n' }, // Mac new window
        { cmd: true, key: 'l' }, // Mac address bar
        { cmd: true, shift: true, key: 'i' }, // Mac dev tools
        { cmd: true, shift: true, key: 'j' }, // Mac console
        { cmd: true, shift: true, key: 'c' }, // Mac inspect
        { cmd: true, shift: true, key: 'delete' }, // Mac clear data
        
        // Windows-specific shortcuts
        { meta: true, key: 'PrintScreen' }, // Windows + Print Screen
        { meta: true, shift: true, key: 's' }, // Windows + Shift + S (Snipping Tool)
        { meta: true, key: 'g' }, // Windows + G (Game Bar)
        { meta: true, key: 'h' }, // Windows + H (Dictation)
        
        // Additional security shortcuts
        { alt: true, key: 'Tab' }, // Alt + Tab (App switching)
        { alt: true, key: 'F4' }, // Alt + F4 (Close window)
        { ctrl: true, alt: true, key: 'Delete' }, // Ctrl + Alt + Delete
        { ctrl: true, shift: true, key: 'Delete' }, // Ctrl + Shift + Delete (Clear data)
        { ctrl: true, shift: true, key: 'n' }, // Incognito/Private window
        { ctrl: true, shift: true, key: 't' }, // Reopen closed tab
        { ctrl: true, shift: true, key: 'w' }, // Close window
      ]

      // Check blocked keys first
      if (blockedKeys.includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        const violationType = e.key === 'PrintScreen' ? 'screenshot_attempt' : 
                             e.key.startsWith('F') ? 'devtools_opened' : 'unauthorized_access'
        
        this.recordViolation({
          type: violationType,
          details: `Blocked key: ${e.key}`,
          severity: e.key === 'PrintScreen' ? 'critical' : 
                   e.key === 'F12' ? 'critical' : 'medium'
        })
        return false
      }

      // Check blocked combinations
      for (const combo of blockedCombos) {
        const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey)
        const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey
        const cmdMatch = combo.cmd ? e.metaKey : !e.metaKey
        const metaMatch = combo.meta ? e.metaKey : !e.metaKey
        const altMatch = combo.alt ? e.altKey : !e.altKey
        const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase()

        if (ctrlMatch && shiftMatch && cmdMatch && metaMatch && altMatch && keyMatch) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          // Determine violation type based on the shortcut
          let violationType: SecurityViolation['type'] = 'copy_attempt'
          let severity: SecurityViolation['severity'] = 'medium'
          
          if (combo.key === 'p') {
            violationType = 'print_attempt'
            severity = 'high'
          } else if (combo.key === 's') {
            violationType = 'save_attempt'
            severity = 'high'
          } else if (['i', 'j', 'c', 'k', 'e', 'm'].includes(combo.key) && (combo.ctrl || combo.cmd) && combo.shift) {
            violationType = 'devtools_opened'
            severity = 'critical'
          } else if (combo.key === 'PrintScreen' || (combo.meta && combo.shift && combo.key === 's')) {
            violationType = 'screenshot_attempt'
            severity = 'critical'
          } else if (['c', 'v', 'x', 'a', 'f', 'g'].includes(combo.key)) {
            violationType = 'copy_attempt'
            severity = 'medium'
          } else {
            violationType = 'unauthorized_access'
            severity = 'low'
          }
          
          const modifiers = [
            combo.ctrl ? 'Ctrl' : '',
            combo.cmd ? 'Cmd' : '',
            combo.meta ? 'Win' : '',
            combo.alt ? 'Alt' : '',
            combo.shift ? 'Shift' : ''
          ].filter(Boolean).join('+')
          
          this.recordViolation({
            type: violationType,
            details: `Blocked keyboard shortcut: ${modifiers}${modifiers ? '+' : ''}${combo.key.toUpperCase()}`,
            severity
          })
          return false
        }
      }
    }
    
    // Add multiple event listeners for comprehensive coverage
    document.addEventListener('keydown', this.handleKeyDown, { capture: true, passive: false })
    window.addEventListener('keydown', this.handleKeyDown, { capture: true, passive: false })
    
    // Also block on keyup for additional security
    this.handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        this.recordViolation({
          type: 'screenshot_attempt',
          details: 'Print Screen detected on keyup',
          severity: 'critical'
        })
      }
    }
    document.addEventListener('keyup', this.handleKeyUp, { capture: true, passive: false })
  }

  private preventDragDrop() {
    this.handleDragStart = (e: Event) => {
      e.preventDefault()
      this.recordViolation({
        type: 'copy_attempt',
        details: 'Drag operation blocked',
        severity: 'low'
      })
      return false
    }

    this.handleDrop = (e: Event) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('dragstart', this.handleDragStart, true)
    document.addEventListener('drop', this.handleDrop, true)
  }

  private detectDevTools() {
    let devtools = { open: false, orientation: null }
    
    this.devToolsDetectionInterval = setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true
          this.recordViolation({
            type: 'devtools_opened',
            details: 'Developer tools detected',
            severity: 'critical'
          })
        }
      } else {
        devtools.open = false
      }
    }, 500)
  }

  private detectScreenshots() {
    // Monitor for screenshot-related activities
    this.screenshotDetectionInterval = setInterval(() => {
      // Check for common screenshot tools
      if (document.hasFocus() === false) {
        // Window lost focus - potential screenshot
        this.recordViolation({
          type: 'screenshot_attempt',
          details: 'Window focus lost - potential screenshot attempt',
          severity: 'medium'
        })
      }
    }, 1000)

    // Monitor for clipboard access
    document.addEventListener('copy', (e) => {
      e.preventDefault()
      this.recordViolation({
        type: 'copy_attempt',
        details: 'Copy operation blocked',
        severity: 'medium'
      })
    })

    // Monitor for paste attempts (could indicate screenshot tools)
    document.addEventListener('paste', (e) => {
      e.preventDefault()
      this.recordViolation({
        type: 'copy_attempt',
        details: 'Paste operation blocked',
        severity: 'low'
      })
    })
  }

  private preventPrinting() {
    this.handleBeforePrint = (e: Event) => {
      e.preventDefault()
      this.recordViolation({
        type: 'print_attempt',
        details: 'Print operation blocked',
        severity: 'high'
      })
      return false
    }

    window.addEventListener('beforeprint', this.handleBeforePrint, true)

    // Override print function
    window.print = () => {
      this.recordViolation({
        type: 'print_attempt',
        details: 'Print function call blocked',
        severity: 'high'
      })
    }

    // Block CSS print media
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        * { display: none !important; }
        body::before {
          content: "🔒 This document is protected and cannot be printed.";
          display: block !important;
          font-size: 24px;
          text-align: center;
          margin-top: 50px;
          color: #dc2626;
        }
      }
    `
    document.head.appendChild(style)
  }

  private preventSaving() {
    // Override save-related functions
    if (typeof window !== 'undefined') {
      // Block common save methods
      const originalOpen = window.open
      window.open = (...args) => {
        this.recordViolation({
          type: 'save_attempt',
          details: 'Window.open blocked - potential save attempt',
          severity: 'medium'
        })
        return null
      }
    }
  }

  private monitorFocusChanges() {
    let focusLostTime: number | null = null

    window.addEventListener('blur', () => {
      focusLostTime = Date.now()
    })

    window.addEventListener('focus', () => {
      if (focusLostTime && Date.now() - focusLostTime > 2000) {
        this.recordViolation({
          type: 'screenshot_attempt',
          details: 'Extended focus loss detected - potential screenshot activity',
          severity: 'medium'
        })
      }
      focusLostTime = null
    })
  }

  private disableDevShortcuts() {
    this.handleWindowKeyDown = (e: KeyboardEvent) => {
      // Disable F12 and other function keys
      if (e.key.startsWith('F') && ['F12', 'F11', 'F10', 'F9'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        this.recordViolation({
          type: 'devtools_opened',
          details: `Function key ${e.key} blocked`,
          severity: 'high'
        })
        return false
      }
    }
    window.addEventListener('keydown', this.handleWindowKeyDown, true)
  }

  getViolations(): SecurityViolation[] {
    return [...this.violations]
  }

  clearViolations() {
    this.violations = []
  }

  // Event handler references for cleanup
  private handleContextMenu!: (e: Event) => boolean | void
  private handleSelectStart!: (e: Event) => boolean
  private handleKeyDown!: (e: KeyboardEvent) => boolean | void
  private handleKeyUp!: (e: KeyboardEvent) => void
  private handleDragStart!: (e: Event) => boolean
  private handleDrop!: (e: Event) => boolean
  private handleBeforePrint!: (e: Event) => boolean | void
  private handleWindowKeyDown!: (e: KeyboardEvent) => boolean | void
}

// Utility function to create and activate DRM protection
export function createDRMProtection(onViolation?: (violation: SecurityViolation) => void): DRMProtection {
  return new DRMProtection(onViolation)
}