'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'
import { useOptimizedAnimations } from '@/hooks/useMobileAnimations'
import { RippleEffect } from '@/components/animations/RippleEffect'
import { isTouchDevice } from '@/lib/animations'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  color?: string
  delay?: number
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  color = 'blue',
  delay = 0 
}: FeatureCardProps) {
  const { getVariants, getSpringConfig } = useOptimizedAnimations()
  const isTouch = isTouchDevice()
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        hoverShadow: 'hover:shadow-blue-200',
        gradient: 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100'
      },
      purple: {
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        hoverShadow: 'hover:shadow-purple-200',
        gradient: 'hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100'
      },
      green: {
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        hoverShadow: 'hover:shadow-green-200',
        gradient: 'hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100'
      },
      orange: {
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        hoverShadow: 'hover:shadow-orange-200',
        gradient: 'hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100'
      },
      pink: {
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        hoverShadow: 'hover:shadow-pink-200',
        gradient: 'hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100'
      },
      cyan: {
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        hoverShadow: 'hover:shadow-cyan-200',
        gradient: 'hover:bg-gradient-to-br hover:from-cyan-50 hover:to-cyan-100'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const colors = getColorClasses(color)

  const cardVariants: Variants = getVariants({
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.0, 0.0, 0.2, 1] as const,
      },
    },
  })

  const iconVariants: Variants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: getSpringConfig(),
    },
  }

  const cardContent = (
    <motion.div
      className={`
        relative p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100
        transition-all duration-300 h-full
        ${!isTouch ? 'cursor-pointer hover:shadow-xl hover:-translate-y-2' : ''}
        ${colors.hoverShadow} ${colors.gradient}
      `}
      whileHover={!isTouch ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
    >
        {/* Icon */}
        <motion.div
          variants={iconVariants}
          className={`
            inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl
            ${colors.iconBg} ${colors.iconColor}
            transition-all duration-300
          `}
        >
          <div className="w-8 h-8">
            {icon}
          </div>
        </motion.div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
            {description}
          </p>
        </div>

        {/* Hover Effect Overlay */}
        {!isTouch && (
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${color === 'blue' ? '#3B82F6' : 
                color === 'purple' ? '#8B5CF6' : 
                color === 'green' ? '#10B981' : 
                color === 'orange' ? '#F59E0B' : 
                color === 'pink' ? '#EC4899' : '#06B6D4'} 0%, transparent 100%)`
            }}
          />
        )}
      </motion.div>
  )

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={cardVariants}
      whileHover="hover"
      className="group"
    >
      {isTouch ? (
        <RippleEffect
          className="rounded-2xl"
          color={`${color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
            color === 'purple' ? 'rgba(139, 92, 246, 0.2)' : 
            color === 'green' ? 'rgba(16, 185, 129, 0.2)' : 
            color === 'orange' ? 'rgba(245, 158, 11, 0.2)' : 
            color === 'pink' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`}
        >
          {cardContent}
        </RippleEffect>
      ) : (
        cardContent
      )}
    </motion.div>
  )
}