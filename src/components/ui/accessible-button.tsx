'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { useAccessibilityContext } from '@/contexts/AccessibilityContext'
import { AccessibleMotionButton } from '@/components/animations/AccessibleMotion'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  ariaLabel?: string
  ariaDescribedBy?: string
  announceOnClick?: string
  motionProps?: Partial<MotionProps>
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
}

const sizeVariants = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]'
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Loading...',
    children,
    className,
    disabled,
    ariaLabel,
    ariaDescribedBy,
    announceOnClick,
    motionProps,
    onClick,
    ...props
  }, ref) => {
    const { config, announceToScreenReader } = useAccessibilityContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e)
      }
      
      // Announce action to screen readers
      if (announceOnClick) {
        announceToScreenReader(announceOnClick)
      }
    }

    const baseClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center',
      'font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-target', // Ensures minimum touch target size
      
      // Variant styles
      buttonVariants[variant],
      
      // Size styles
      sizeVariants[size],
      
      // Custom classes
      className
    )

    const defaultMotionProps = {
      whileHover: config.enableAnimations ? { scale: 1.02 } : undefined,
      whileTap: config.enableAnimations ? { scale: 0.98 } : undefined,
      transition: { duration: config.animationDuration * 0.15 },
      ...motionProps
    }

    const buttonContent = (
      <>
        {loading && (
          <div className="mr-2 flex items-center">
            <div className="loading-indicator" aria-hidden="true" />
            <span className="sr-only">{loadingText}</span>
          </div>
        )}
        <span className={loading ? 'opacity-70' : ''}>
          {loading ? loadingText : children}
        </span>
      </>
    )

    return (
      <AccessibleMotionButton
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        ariaLabel={ariaLabel}
        ariaDescribedBy={ariaDescribedBy}
        aria-busy={loading}
        {...defaultMotionProps}
        {...props}
      >
        {buttonContent}
      </AccessibleMotionButton>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Specialized button variants
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="primary" {...props} />
)

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="secondary" {...props} />
)

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="outline" {...props} />
)

export const GhostButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="ghost" {...props} />
)

export const DestructiveButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="destructive" {...props} />
)

PrimaryButton.displayName = 'PrimaryButton'
SecondaryButton.displayName = 'SecondaryButton'
OutlineButton.displayName = 'OutlineButton'
GhostButton.displayName = 'GhostButton'
DestructiveButton.displayName = 'DestructiveButton'