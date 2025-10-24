'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  icon?: React.ReactNode
  placeholder?: string
  className?: string
  onBlur?: () => void
  onFocus?: () => void
}

export function FormField({
  label,
  type,
  value,
  onChange,
  error,
  required = false,
  icon,
  placeholder,
  className = '',
  onBlur,
  onFocus,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const id = useId()
  
  const isPassword = type === 'password'
  const hasValue = value.length > 0
  const isFloating = isFocused || hasValue
  
  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }
  
  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }
  
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={cn('relative', className)}>
      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <div className={cn(
              'transition-colors duration-200',
              isFocused ? 'text-blue-500' : 'text-gray-400',
              error && 'text-red-500'
            )}>
              {icon}
            </div>
          </div>
        )}
        
        {/* Input Field */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFloating ? placeholder : ''}
          required={required}
          className={cn(
            'w-full px-4 py-4 text-gray-900 bg-white border-2 rounded-lg transition-all duration-200 outline-none',
            'focus:ring-0 focus:outline-none',
            icon && 'pl-12',
            isPassword && 'pr-12',
            // Border colors
            isFocused && !error && 'border-blue-500 shadow-lg shadow-blue-500/20',
            !isFocused && !error && 'border-gray-200 hover:border-gray-300',
            error && 'border-red-500 shadow-lg shadow-red-500/20',
            // Background gradient on focus
            isFocused && 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
          )}
        />
        
        {/* Floating Label */}
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            y: isFloating ? -28 : 16,
            scale: isFloating ? 0.85 : 1,
            color: error ? '#EF4444' : isFocused ? '#3B82F6' : '#6B7280',
          }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className={cn(
            'absolute left-4 pointer-events-none font-medium origin-left',
            icon && 'left-12',
            isFloating && 'bg-white px-2 -ml-2'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
        
        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
        
        {/* Success Indicator */}
        {!error && hasValue && !isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: 'auto',
              x: [0, -5, 5, -5, 5, 0] // Shake animation
            }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ 
              duration: 0.2,
              x: { duration: 0.5, ease: 'easeInOut' }
            }}
            className="flex items-center gap-2 mt-2 text-sm text-red-600"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            </motion.div>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}