'use client'

import { forwardRef, InputHTMLAttributes, useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessibilityContext } from '@/contexts/AccessibilityContext'
import { cn } from '@/lib/utils'

interface AccessibleFormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  success?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'floating'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const sizeVariants = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-5 py-4 text-lg min-h-[52px]'
}

export const AccessibleFormField = forwardRef<HTMLInputElement, AccessibleFormFieldProps>(
  ({
    label,
    error,
    success,
    hint,
    size = 'md',
    variant = 'default',
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    className,
    type = 'text',
    required,
    disabled,
    ...props
  }, ref) => {
    const { config, announceToScreenReader } = useAccessibilityContext()
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const fieldId = useId()
    const errorId = useId()
    const hintId = useId()
    const successId = useId()

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type

    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const hasHint = !!hint

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (props.onFocus) {
        props.onFocus(e)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (props.onBlur) {
        props.onBlur(e)
      }
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
      announceToScreenReader(showPassword ? 'Password hidden' : 'Password visible')
    }

    const baseInputClasses = cn(
      // Base styles
      'w-full border rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
      
      // Size styles
      sizeVariants[size],
      
      // State styles
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50',
      hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50',
      !hasError && !hasSuccess && 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      
      // Icon padding
      leftIcon && 'pl-10',
      (rightIcon || showPasswordToggle) && 'pr-10',
      
      className
    )

    const labelClasses = cn(
      'block text-sm font-medium mb-2',
      hasError && 'text-red-700',
      hasSuccess && 'text-green-700',
      !hasError && !hasSuccess && 'text-gray-700',
      disabled && 'opacity-50'
    )

    const floatingLabelClasses = cn(
      'absolute left-3 transition-all duration-200 pointer-events-none',
      'text-gray-500',
      (isFocused || props.value) ? 'top-2 text-xs' : `top-1/2 -translate-y-1/2 text-base`,
      hasError && 'text-red-500',
      hasSuccess && 'text-green-500'
    )

    const errorAnimation = {
      initial: { opacity: 0, y: -10, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -10, scale: 0.95 },
      transition: { 
        duration: config.enableAnimations ? 0.2 : 0.01,
        ease: 'easeOut'
      }
    }

    const shakeAnimation = {
      animate: hasError ? { x: [-10, 10, -10, 10, 0] } : {},
      transition: { 
        duration: config.enableAnimations ? 0.4 : 0.01,
        ease: 'easeInOut'
      }
    }

    // Build aria-describedby
    const ariaDescribedBy = [
      hasHint && hintId,
      hasError && errorId,
      hasSuccess && successId,
      props['aria-describedby']
    ].filter(Boolean).join(' ')

    return (
      <div className="form-field">
        {variant === 'default' && (
          <label htmlFor={fieldId} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            id={fieldId}
            type={inputType}
            className={baseInputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={ariaDescribedBy || undefined}
            aria-required={required}
            disabled={disabled}
            {...shakeAnimation}
            {...props}
          />

          {/* Floating Label */}
          {variant === 'floating' && (
            <label htmlFor={fieldId} className={floatingLabelClasses}>
              {label}
              {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>
          )}

          {/* Right Icon or Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              ) : rightIcon ? (
                <div className="text-gray-400 pointer-events-none">
                  {rightIcon}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hasHint && (
          <p id={hintId} className="mt-1 text-sm text-gray-600">
            {hint}
          </p>
        )}

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {hasError && (
            <motion.p
              id={errorId}
              className="mt-1 text-sm text-red-600 flex items-center"
              role="alert"
              aria-live="polite"
              {...errorAnimation}
            >
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence mode="wait">
          {hasSuccess && (
            <motion.p
              id={successId}
              className="mt-1 text-sm text-green-600 flex items-center"
              role="status"
              aria-live="polite"
              {...errorAnimation}
            >
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AccessibleFormField.displayName = 'AccessibleFormField'