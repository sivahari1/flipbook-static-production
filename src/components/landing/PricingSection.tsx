'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { PricingCard } from '@/components/ui/pricing-card'
import { BillingToggle } from '@/components/ui/billing-toggle'
import { ScrollTrigger } from '@/components/animations'
import { animationConfig, fadeInVariants, staggerContainerVariants } from '@/lib/animations'
import { subscriptionPlans, PricingPlan } from '@/lib/subscription-plans'
import { redirectToCheckout, redirectToContactSales } from '@/lib/checkout'



interface PricingSectionProps {
  onPlanSelect?: (planId: string, billingCycle: 'monthly' | 'yearly') => void
}

export function PricingSection({ onPlanSelect }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handlePlanSelect = async (planId: string) => {
    onPlanSelect?.(planId, billingCycle)
    
    if (planId === 'enterprise') {
      redirectToContactSales()
    } else {
      await redirectToCheckout({
        planId,
      })
    }
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const headerVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 30,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: animationConfig.duration.slow,
        ease: animationConfig.easing.easeOut,
      },
    },
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollTrigger className="text-center mb-16">
          <motion.div variants={headerVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the duration that fits your needs. All plans include secure document sharing, 
              watermarking, and analytics with increasing storage and features.
            </p>
          </motion.div>
        </ScrollTrigger>

        {/* Duration-based plans - no billing toggle needed */}

        {/* Pricing Cards */}
        <ScrollTrigger>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-full mx-auto"
          >
            {subscriptionPlans.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                onSelect={handlePlanSelect}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        </ScrollTrigger>

        {/* Plan Comparison Table */}
        <ScrollTrigger className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Compare Plans
            </h3>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Features
                      </th>
                      {subscriptionPlans.map((plan) => (
                        <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Documents
                      </td>
                      {subscriptionPlans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.limits.documents === -1 ? 'Unlimited' : plan.limits.documents}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Storage
                      </td>
                      {subscriptionPlans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.limits.storage}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Team Members
                      </td>
                      {subscriptionPlans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        API Calls/month
                      </td>
                      {subscriptionPlans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.limits.apiCalls === -1 ? 'Unlimited' : 
                           plan.limits.apiCalls === 0 ? 'Not included' : 
                           plan.limits.apiCalls?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </ScrollTrigger>

        {/* FAQ or Additional Info */}
        <ScrollTrigger className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-gray-600 mb-4">
              Start with a 7-day free trial. No credit card required to get started.
            </p>
            <p className="text-sm text-gray-500 mb-2">
              * All prices are in Indian Rupees (₹). GST will be added as applicable.
            </p>
            <p className="text-sm text-gray-500">
              Need a custom solution? <a href="mailto:sales@flipbook-drm.com" className="text-blue-600 hover:underline">Contact our sales team</a> for enterprise pricing.
            </p>
          </motion.div>
        </ScrollTrigger>
      </div>
    </section>
  )
}