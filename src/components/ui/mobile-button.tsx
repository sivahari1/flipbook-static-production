'use client'

import { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { RippleEffect } from '@/components/animations/RippleEffect'
import { touchInteractionVariants, isTouchDevice } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface MobileButtonProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  rippleColor?: string
  className?: string
  onClick?: (event: React.MouseEvent) => void
  onTouchStart?: (event: React.TouchEvent) => void
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    rippleColor,
    className = '',
    onClick,
    onTouchStart,
    ...motionProps
  }, ref) => {
    const isTouch = isTouchDevice()
    
    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 outline-none focus:outline-none',
      'select-none touch-manipulation', // Improve touch performance
      {
        // Variants
        'bg-gradient-primary text-white shadow-lg hover:shadow-xl': variant === 'primary',
        'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
        'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400': variant === 'outline',
        'text-gray-600 hover:bg-gray-100': variant === 'ghost',
        
        // Sizes
        'px-3 py-2 text-sm min-h-[36px]': size === 'sm',
        'px-4 py-3 text-base min-h-[44px]': size === 'md', // 44px minimum for touch targets
        'px-6 py-4 text-lg min-h-[52px]': size === 'lg',
        
        // States
        'opacity-50 cursor-not-allowed': disabled || loading,
        'cursor-pointer': !disabled && !loading,
      },
      className
    )

    const getRippleColor = () => {
      if (rippleColor) return rippleColor
      
      switch (variant) {
        case 'primary':
          return 'rgba(255, 255, 255, 0.3)'
        case 'secondary':
          return 'rgba(0, 0, 0, 0.1)'
        case 'outline':
          return 'rgba(59, 130, 246, 0.2)'
        case 'ghost':
          return 'rgba(0, 0, 0, 0.05)'
        default:
          return 'rgba(255, 255, 255, 0.3)'
      }
    }

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          </motion.div>
        )}
        {children}
      </>
    )

    const MotionButton = motion.button

    if (isTouch) {
      return (
        <RippleEffect
          color={getRippleColor()}
          disabled={disabled || loading}
          className="rounded-lg"
        >
          <MotionButton
            ref={ref}
            className={baseClasses}
            disabled={disabled || loading}
            variants={touchInteractionVariants}
            initial="idle"
            whileTap="pressed"
            onClick={onClick}
            onTouchStart={onTouchStart}
            {...motionProps}
          >
            {buttonContent}
          </MotionButton>
        </RippleEffect>
      )
    }

    // Desktop version with hover effects
    return (
      <MotionButton
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        {...motionProps}
      >
        {buttonContent}
      </MotionButton>
    )
  }
)

MobileButton.displayName = 'MobileButton'