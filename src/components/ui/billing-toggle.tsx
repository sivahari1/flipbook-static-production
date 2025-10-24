'use client'

import { motion } from 'framer-motion'

interface BillingToggleProps {
  billingCycle: 'monthly' | 'yearly'
  onToggle: (cycle: 'monthly' | 'yearly') => void
  yearlyDiscount?: number
}

export function BillingToggle({ 
  billingCycle, 
  onToggle, 
  yearlyDiscount = 20 
}: BillingToggleProps) {
  const toggleVariants = {
    monthly: { x: 0 },
    yearly: { x: '100%' },
  }

  return (
    <div className="flex items-center justify-center space-x-4 mb-12">
      <span className={`text-lg font-medium transition-colors ${
        billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
      }`}>
        Monthly
      </span>
      
      <div className="relative">
        {/* Toggle Background */}
        <div className="w-24 h-12 bg-gray-200 rounded-full p-1 cursor-pointer"
             onClick={() => onToggle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
          {/* Toggle Slider */}
          <motion.div
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
            variants={toggleVariants}
            animate={billingCycle}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div
              animate={{ rotate: billingCycle === 'yearly' ? 360 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-6 h-6 bg-gradient-primary rounded-full"
            />
          </motion.div>
        </div>
        
        {/* Yearly Discount Badge */}
        {billingCycle === 'yearly' && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            className="absolute -top-8 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold"
          >
            -{yearlyDiscount}%
          </motion.div>
        )}
      </div>
      
      <span className={`text-lg font-medium transition-colors ${
        billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'
      }`}>
        Yearly
      </span>
    </div>
  )
}