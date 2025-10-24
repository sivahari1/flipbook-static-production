'use client'

import { motion } from 'framer-motion'
import { TouchCarousel } from '@/components/animations/TouchCarousel'
import { useOptimizedAnimations } from '@/hooks/useMobileAnimations'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar?: string
  rating: number
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  autoPlayInterval?: number
  className?: string
}

function TestimonialSlide({ testimonial }: { testimonial: Testimonial }) {
  const { getVariants, animationConfig } = useOptimizedAnimations()

  return (
    <div className="h-full flex flex-col justify-center items-center text-center text-white p-4 md:p-8">
      {/* Stars rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <motion.svg
            key={i}
            className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: i * 0.1, 
              duration: animationConfig.duration.fast 
            }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </motion.svg>
        ))}
      </div>

      {/* Testimonial content */}
      <motion.blockquote 
        className="text-base md:text-lg lg:text-xl font-medium mb-6 leading-relaxed max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.2, 
          duration: animationConfig.duration.normal 
        }}
      >
        "{testimonial.content}"
      </motion.blockquote>

      {/* Author info */}
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.4, 
          duration: animationConfig.duration.normal 
        }}
      >
        {testimonial.avatar && (
          <div className="w-12 h-12 rounded-full bg-white/20 mb-3 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {testimonial.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="text-center">
          <div className="font-semibold text-lg">{testimonial.name}</div>
          <div className="text-blue-100 text-sm">
            {testimonial.role} at {testimonial.company}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function TestimonialCarousel({ 
  testimonials, 
  autoPlayInterval = 5000,
  className = '' 
}: TestimonialCarouselProps) {
  if (!testimonials.length) {
    return null
  }

  const testimonialSlides = testimonials.map((testimonial) => (
    <div 
      key={testimonial.id}
      className="h-80 md:h-64 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
    >
      <TestimonialSlide testimonial={testimonial} />
    </div>
  ))

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      <TouchCarousel
        autoPlay={true}
        autoPlayInterval={autoPlayInterval}
        showDots={true}
        showArrows={true}
        className="h-80 md:h-64"
      >
        {testimonialSlides}
      </TouchCarousel>
    </div>
  )
}