'use client'

import { TestimonialCarousel } from './TestimonialCarousel'
import { FadeIn } from '@/components/animations/FadeIn'
import { StaggeredList } from '@/components/animations/StaggeredList'
import { testimonialsData, customerLogos, trustIndicators } from '@/lib/testimonials'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix: string
  duration?: number
}

function AnimatedCounter({ value, suffix, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(easeOutQuart * value)
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  return (
    <span className="text-3xl md:text-4xl font-bold text-gray-900">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who trust our platform to secure and share their most important documents
          </p>
        </FadeIn>

        {/* Testimonial Carousel */}
        <FadeIn delay={0.2} className="mb-20">
          <TestimonialCarousel 
            testimonials={testimonialsData}
            autoPlayInterval={6000}
          />
        </FadeIn>

        {/* Trust Indicators */}
        <FadeIn delay={0.4} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={indicator.label}
                className="bg-white rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <AnimatedCounter 
                  value={indicator.value} 
                  suffix={indicator.suffix}
                />
                <p className="text-gray-600 mt-2 font-medium">{indicator.label}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Customer Logos */}
        <FadeIn delay={0.6}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-8">
              Trusted by leading organizations worldwide
            </h3>
            <StaggeredList className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
              {customerLogos.map((customer, index) => (
                <motion.div
                  key={customer.name}
                  className="flex items-center justify-center h-12 w-32 bg-white rounded-lg shadow-sm p-4"
                  whileHover={{ scale: 1.05, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Placeholder for logo - in a real app, you'd use an Image component */}
                  <div className="text-gray-400 font-semibold text-sm text-center">
                    {customer.name.split(' ').map(word => word.charAt(0)).join('')}
                  </div>
                </motion.div>
              ))}
            </StaggeredList>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}