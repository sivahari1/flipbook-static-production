'use client'

import { motion } from 'framer-motion'
import { FeatureCard } from '@/components/ui/feature-card'
import { ScrollTrigger } from '@/components/animations'

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

interface FeatureCardsProps {
  features: FeatureItem[]
  title?: string
  subtitle?: string
  animationDelay?: number
}

export function FeatureCards({ 
  features, 
  title = "Why Choose Our Platform",
  subtitle = "Discover the powerful features that make our platform the best choice for secure document sharing",
  animationDelay = 0 
}: FeatureCardsProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const headerVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.0, 0.0, 0.2, 1],
      },
    },
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollTrigger className="text-center mb-16">
          <motion.div variants={headerVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </ScrollTrigger>

        {/* Features Grid */}
        <ScrollTrigger>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        </ScrollTrigger>
      </div>
    </section>
  )
}