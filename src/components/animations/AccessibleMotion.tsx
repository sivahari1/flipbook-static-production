'use client'

import { motion, MotionProps, Variants } from 'framer-motion'
import { forwardRef, ReactNode } from 'react'
import { useAccessibilityContext } from '@/contexts/AccessibilityContext'
import { getAccessibleAnimationProps } from '@/lib/animations'

interface AccessibleMotionProps extends Omit<MotionProps, 'children'> {
  children: ReactNode
  fallbackToStatic?: boolean
  respectReducedMotion?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  role?: string
  focusable?: boolean
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  tabIndex?: number
}

// Accessible motion div component
export const AccessibleMotionDiv = forwardRef<HTMLDivElement, AccessibleMotionProps>(
  ({ 
    children, 
    fallbackToStatic = true,
    respectReducedMotion = true,
    ariaLabel,
    ariaDescribedBy,
    role,
    focusable = false,
    className,
    onClick,
    onKeyDown,
    tabIndex,
    ...motionProps 
  }, ref) => {
    const { config, preferences } = useAccessibilityContext()

    const accessibleProps = getAccessibleAnimationProps(motionProps, {
      respectReducedMotion,
      staticFallback: fallbackToStatic
    })

    const ariaProps = {
      ...(ariaLabel && { 'aria-label': ariaLabel }),
      ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
      ...(role && { role }),
      ...(focusable && { tabIndex: tabIndex ?? 0 }),
      ...(tabIndex !== undefined && { tabIndex }),
      ...(onClick && { onClick }),
      ...(onKeyDown && { onKeyDown }),
      // Announce animation state to screen readers if needed
      ...(preferences.prefersReducedMotion && { 'aria-live': 'polite' as const })
    }

    if (!config.enableAnimations) {
      return (
        <div ref={ref} {...ariaProps} className={className}>
          {children}
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        {...accessibleProps}
        {...ariaProps}
        className={className}
      >
        {children}
      </motion.div>
    )
  }
)

AccessibleMotionDiv.displayName = 'AccessibleMotionDiv'

// Accessible motion button component
export const AccessibleMotionButton = forwardRef<HTMLButtonElement, AccessibleMotionProps & {
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(
  ({ 
    children, 
    onClick,
    disabled = false,
    type = 'button',
    fallbackToStatic = true,
    respectReducedMotion = true,
    ariaLabel,
    ariaDescribedBy,
    focusable = true,
    ...motionProps 
  }, ref) => {
    const { config, announceToScreenReader } = useAccessibilityContext()

    const accessibleProps = getAccessibleAnimationProps(motionProps, {
      respectReducedMotion,
      staticFallback: fallbackToStatic
    })

    const handleClick = () => {
      if (onClick) {
        onClick()
        // Announce button action to screen readers if needed
        if (ariaLabel) {
          announceToScreenReader(`${ariaLabel} activated`)
        }
      }
    }

    const ariaProps = {
      ...(ariaLabel && { 'aria-label': ariaLabel }),
      ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
      'aria-disabled': disabled,
      disabled,
      type,
      onClick: handleClick
    }

    if (!config.enableAnimations) {
      return (
        <button ref={ref} {...ariaProps} className={motionProps.className}>
          {children}
        </button>
      )
    }

    return (
      <motion.button
        ref={ref}
        {...accessibleProps}
        {...ariaProps}
        whileHover={disabled ? undefined : accessibleProps.whileHover}
        whileTap={disabled ? undefined : accessibleProps.whileTap}
      >
        {children}
      </motion.button>
    )
  }
)

AccessibleMotionButton.displayName = 'AccessibleMotionButton'

// Hook for creating accessible animation variants
export function useAccessibleVariants(baseVariants: Variants) {
  const { config } = useAccessibilityContext()

  if (!config.enableAnimations) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    }
  }

  // Adjust animation duration based on accessibility preferences
  const adjustedVariants: Variants = {}
  
  Object.keys(baseVariants).forEach(key => {
    const variant = baseVariants[key]
    if (typeof variant === 'object' && variant !== null) {
      adjustedVariants[key] = {
        ...variant,
        transition: {
          ...variant.transition,
          duration: variant.transition?.duration ? 
            variant.transition.duration * config.animationDuration : 
            config.animationDuration
        }
      }
    } else {
      adjustedVariants[key] = variant
    }
  })

  return adjustedVariants
}

// Accessible stagger container
export function AccessibleStaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  ...props 
}: AccessibleMotionProps & { staggerDelay?: number }) {
  const { config } = useAccessibilityContext()
  
  const staggerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: config.enableAnimations ? staggerDelay : 0,
        delayChildren: config.enableAnimations ? 0.1 : 0
      }
    }
  }

  return (
    <AccessibleMotionDiv
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </AccessibleMotionDiv>
  )
}