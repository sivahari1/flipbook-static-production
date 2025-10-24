# 🔒 Idle Timeout Implementation - FlipBook DRM

## 📋 Overview

The idle timeout feature automatically logs out users after 15 minutes of inactivity to enhance security. This is especially important for a document management system handling sensitive files.

## ⏰ Timeout Configuration

- **Idle Timeout**: 15 minutes (900,000 ms)
- **Warning Period**: 1 minute before timeout (60 seconds)
- **Activity Detection**: Mouse, keyboard, touch, scroll events

## 🏗️ Architecture

### 1. Custom Hook: `useIdleTimeout`
**Location**: `src/hooks/useIdleTimeout.ts`

```typescript
interface UseIdleTimeoutOptions {
  timeout: number        // timeout in milliseconds
  onTimeout: () => void  // callback when timeout occurs
  enabled?: boolean      // enable/disable the timer
  events?: string[]      // events to detect activity
}
```

**Features**:
- Configurable timeout duration
- Multiple activity event detection
- Enable/disable functionality
- Manual reset and clear methods

### 2. Session Warning Component: `SessionTimeoutWarning`
**Location**: `src/components/auth/SessionTimeoutWarning.tsx`

**Features**:
- Animated modal with countdown timer
- Progress bar showing time remaining
- Two action buttons: "Stay Logged In" and "Logout Now"
- Security explanation for user awareness
- Auto-logout if no action taken

### 3. Session Notification: `SessionNotification`
**Location**: `src/components/ui/SessionNotification.tsx`

**Features**:
- Success notification when session extended
- Animated toast-style notification
- Auto-hide after 3 seconds
- Customizable message and type

### 4. AuthContext Integration
**Location**: `src/contexts/AuthContext.tsx`

**New Features Added**:
- Idle timeout management
- Session extension functionality
- Warning modal state management
- Activity-based timer reset

## 🔧 Implementation Details

### Activity Detection Events
```typescript
const events = [
  'mousedown',   // Mouse clicks
  'mousemove',   // Mouse movement
  'keypress',    // Keyboard input
  'scroll',      // Page scrolling
  'touchstart',  // Touch interactions
  'click',       // Click events
  'wheel'        // Mouse wheel
]
```

### Timer Flow
1. **User Authentication**: Timer starts when user logs in
2. **Activity Monitoring**: Any detected activity resets the 15-minute timer
3. **Warning Phase**: After 14 minutes of inactivity, warning modal appears
4. **Decision Time**: User has 60 seconds to extend session or logout
5. **Auto-Logout**: If no action taken, user is automatically logged out
6. **Session Extension**: Clicking "Stay Logged In" resets timer for another 15 minutes

## 🎨 User Experience

### Warning Modal Features
- **Visual Design**: Clean, professional modal with security theme
- **Countdown Display**: Real-time countdown in MM:SS format
- **Progress Bar**: Visual representation of time remaining
- **Clear Actions**: Two prominent buttons for user decision
- **Security Context**: Explanation of why timeout exists

### Notification System
- **Success Feedback**: Confirmation when session extended
- **Non-Intrusive**: Toast notification that auto-dismisses
- **Informative**: Shows new session duration

## 🔐 Security Benefits

1. **Unattended Device Protection**: Prevents unauthorized access when user steps away
2. **Compliance**: Meets security standards for document management systems
3. **User Awareness**: Educates users about security practices
4. **Configurable**: Easy to adjust timeout duration for different security requirements

## 🚀 Usage Examples

### Basic Implementation (Already Integrated)
The idle timeout is automatically active for all authenticated users. No additional setup required.

### Manual Session Extension
```typescript
const { extendSession } = useAuth()

// Extend session programmatically
const handleExtendSession = () => {
  extendSession()
}
```

### Custom Timeout Duration
To change the timeout duration, modify the constants in `AuthContext.tsx`:

```typescript
// Change from 15 minutes to 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_TIME = 60 * 1000         // 1 minute warning
```

## 🧪 Testing

### Manual Testing Steps
1. **Login** to the application
2. **Wait 14 minutes** without any activity
3. **Verify** warning modal appears
4. **Test Extension**: Click "Stay Logged In" and verify session continues
5. **Test Auto-Logout**: Let countdown reach zero and verify logout

### Development Testing
For faster testing during development, temporarily reduce the timeout:

```typescript
// Temporary: 2 minutes for testing
const SESSION_TIMEOUT = 2 * 60 * 1000  // 2 minutes
const WARNING_TIME = 30 * 1000         // 30 seconds warning
```

### Activity Testing
Test that these activities reset the timer:
- Mouse movement
- Clicking buttons
- Typing in forms
- Scrolling pages
- Touch interactions (mobile)

## 📱 Mobile Considerations

The idle timeout works on mobile devices with:
- **Touch Events**: `touchstart` events reset the timer
- **Responsive Design**: Warning modal adapts to mobile screens
- **Touch-Friendly**: Large buttons for easy interaction

## ⚙️ Configuration Options

### Environment Variables
Add to `.env` for different environments:

```env
# Development: Shorter timeout for testing
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=2

# Production: Standard security timeout
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=15
```

### Feature Flags
Disable idle timeout for specific user roles:

```typescript
const idleTimeout = useIdleTimeout({
  timeout: SESSION_TIMEOUT - WARNING_TIME,
  onTimeout: handleIdleTimeout,
  enabled: !!user && !isSigningOut && user.role !== 'ADMIN' // Disable for admins
})
```

## 🔍 Monitoring & Analytics

### Metrics to Track
- Session extension frequency
- Auto-logout occurrences
- Average session duration
- User response to timeout warnings

### Implementation Example
```typescript
const extendSession = () => {
  setShowTimeoutWarning(false)
  setShowSessionNotification(true)
  
  // Analytics tracking
  analytics.track('session_extended', {
    userId: user.id,
    sessionDuration: Date.now() - sessionStartTime
  })
  
  idleTimeout.reset()
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Timer Not Resetting**
   - Check if activity events are properly bound
   - Verify `enabled` prop is true
   - Ensure no JavaScript errors blocking event listeners

2. **Warning Not Showing**
   - Check `showTimeoutWarning` state
   - Verify modal z-index is sufficient
   - Check for CSS conflicts

3. **Auto-Logout Not Working**
   - Verify `onTimeout` callback is properly set
   - Check for errors in logout function
   - Ensure timer is not being reset unexpectedly

### Debug Mode
Add debug logging to track timer behavior:

```typescript
const idleTimeout = useIdleTimeout({
  timeout: SESSION_TIMEOUT - WARNING_TIME,
  onTimeout: () => {
    console.log('Idle timeout triggered')
    handleIdleTimeout()
  },
  enabled: !!user && !isSigningOut
})
```

## 📊 Performance Impact

- **Minimal CPU Usage**: Event listeners are passive
- **Memory Efficient**: Single timer per session
- **No Network Calls**: All logic runs client-side
- **Optimized Events**: Debounced activity detection

## 🔄 Future Enhancements

1. **Server-Side Validation**: Validate session timeout on server
2. **Multiple Device Support**: Sync timeout across user's devices
3. **Activity Heatmap**: Track which activities are most common
4. **Smart Timeout**: Adjust timeout based on user behavior patterns
5. **Grace Period**: Allow brief activity after timeout for recovery

## ✅ Production Checklist

- [x] 15-minute idle timeout implemented
- [x] 1-minute warning before logout
- [x] Activity detection for all interaction types
- [x] Animated warning modal with countdown
- [x] Session extension functionality
- [x] Success notifications
- [x] Mobile-responsive design
- [x] TypeScript type safety
- [x] Error handling and cleanup
- [x] Security-focused user messaging

## 🎉 Conclusion

The idle timeout feature enhances FlipBook DRM's security posture by automatically protecting user sessions from unauthorized access. The implementation provides a smooth user experience while maintaining strict security standards required for document management systems.

**Key Benefits**:
- ✅ Enhanced security for sensitive documents
- ✅ Compliance with security best practices
- ✅ User-friendly warning system
- ✅ Configurable timeout duration
- ✅ Mobile and desktop compatibility
- ✅ Production-ready implementation