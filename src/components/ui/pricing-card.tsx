'use client'

import { motion, Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { animationConfig } from '@/lib/animations'
import { PricingPlan, calculateYearlySavings } from '@/lib/subscription-plans'
import { MobileButton } from '@/components/ui/mobile-button'
import { useOptimizedAnimations } from '@/hooks/useMobileAnimations'
import { formatINR, formatYearlySavings } from '@/lib/currency'

interface PricingCardProps {
  plan: PricingPlan
  billingCycle: 'monthly' | 'yearly'
  onSelect: (planId: string) => void
  delay?: number
}

export function PricingCard({ 
  plan, 
  billingCycle, 
  onSelect, 
  delay = 0 
}: PricingCardProps) {
  // For duration-based plans, we show the full price
  const price = plan.pricing.monthly
  const yearlyPrice = plan.pricing.yearly
  const savings = 0 // No savings for duration-based plans
  const { getVariants, getSpringConfig } = useOptimizedAnimations()

  const cardVariants: Variants = getVariants({
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: animationConfig.easing.easeOut,
      },
    },
  })

  const popularBadgeVariants: Variants = getVariants({
    hidden: { scale: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        ...getSpringConfig(),
        delay: delay + 0.3,
      }
    },
  })

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={cardVariants}
      className="relative group"
    >
      {/* Popular Badge */}
      {plan.popular && (
        <motion.div
          variants={popularBadgeVariants}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Most Popular
            </motion.span>
          </div>
        </motion.div>
      )}

      <motion.div
        className={`
          relative h-full p-8 rounded-2xl border-2 transition-all duration-300
          ${plan.popular 
            ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl' 
            : 'border-gray-200 bg-white hover:border-gray-300 shadow-lg hover:shadow-xl'
          }
        `}
        whileHover={{
          scale: 1.02,
          y: -5,
          transition: { duration: 0.2 }
        }}
      >
        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {plan.name}
          </h3>
          <p className="text-gray-600 mb-6">
            {plan.description}
          </p>

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-baseline justify-center">
              {plan.id === 'free-trial' ? (
                <>
                  <span className="text-5xl font-bold text-green-600">
                    FREE
                  </span>
                  <span className="text-gray-600 ml-2">
                    for 7 days
                  </span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-bold text-gray-900">
                    {formatINR(price)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {plan.id === 'monthly' ? '/month' : 
                     plan.id === 'quarterly' ? '/3 months' :
                     plan.id === 'biannual' ? '/6 months' :
                     plan.id === 'annual' ? '/year' : '/period'}
                  </span>
                </>
              )}
            </div>
            
            {billingCycle === 'yearly' && savings > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2"
              >
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Save {formatYearlySavings(plan.pricing.monthly, plan.pricing.yearly)}/year
                </span>
              </motion.div>
            )}
            
            {billingCycle === 'yearly' && (
              <div className="text-sm text-gray-500 mt-1">
                {formatINR(yearlyPrice)}/year
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + (index * 0.1) }}
              className="flex items-start space-x-3"
            >
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                ${feature.included 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {feature.included ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </div>
              <div className="flex-1">
                <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                  {feature.name}
                  {feature.limit && (
                    <span className="text-gray-500"> (up to {feature.limit})</span>
                  )}
                </span>
                {feature.description && (
                  <div className="text-xs text-gray-400 mt-1">
                    {feature.description}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <MobileButton
          onClick={() => {
            if (plan.id === 'free-trial') {
              window.location.href = '/auth/register'
            } else {
              onSelect(plan.id)
            }
          }}
          variant={plan.popular ? 'primary' : 'outline'}
          size="lg"
          className="w-full"
          rippleColor={plan.popular ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.2)'}
        >
          {plan.ctaText || 'Get Started'}
        </MobileButton>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
          style={{
            background: plan.color.gradient,
          }}
        />
      </motion.div>
    </motion.div>
  )
}