'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isTouchDevice, getDeviceAnimationConfig } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface TouchCarouselProps {
  children: React.ReactNode[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
  onSlideChange?: (index: number) => void
}

export function TouchCarousel({
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  onSlideChange,
}: TouchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })
  
  const isTouch = isTouchDevice()
  const animationConfig = getDeviceAnimationConfig()
  
  const totalSlides = children.length
  const swipeThreshold = 50 // Minimum distance for swipe
  const swipeVelocityThreshold = 500 // Minimum velocity for swipe

  // Calculate drag constraints
  useEffect(() => {
    const slideWidth = 100 // Percentage
    setDragConstraints({
      left: -(totalSlides - 1) * slideWidth,
      right: 0,
    })
  }, [totalSlides])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, autoPlayInterval, totalSlides])

  // Pause auto-play on user interaction
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
  }, [])

  const resumeAutoPlay = useCallback(() => {
    if (autoPlay) {
      setIsAutoPlaying(true)
    }
  }, [autoPlay])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    onSlideChange?.(index)
    pauseAutoPlay()
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % totalSlides
    goToSlide(newIndex)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info
    
    // Determine swipe direction and strength
    const swipeDistance = Math.abs(offset.x)
    const swipeVelocity = Math.abs(velocity.x)
    
    if (swipeDistance > swipeThreshold || swipeVelocity > swipeVelocityThreshold) {
      if (offset.x > 0) {
        // Swiped right - go to previous
        goToPrevious()
      } else {
        // Swiped left - go to next
        goToNext()
      }
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  }

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={pauseAutoPlay}
      onTouchEnd={resumeAutoPlay}
    >
      {/* Carousel Container */}
      <div className="relative h-full">
        <AnimatePresence mode="wait" custom={currentIndex}>
          <motion.div
            key={currentIndex}
            custom={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: animationConfig.duration.normal,
              ease: animationConfig.easing.easeInOut,
            }}
            drag={isTouch ? "x" : false}
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full"
            style={{ touchAction: 'pan-y' }} // Allow vertical scrolling
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {showArrows && !isTouch && (
        <>
          <motion.button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            onClick={goToPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          
          <motion.button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            onClick={goToNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </motion.button>
        </>
      )}

      {/* Touch-friendly navigation dots */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {children.map((_, index) => (
            <motion.button
              key={index}
              className={cn(
                'rounded-full transition-all duration-200',
                isTouch ? 'w-3 h-3 p-2' : 'w-2 h-2', // Larger touch targets
                currentIndex === index
                  ? 'bg-white shadow-lg'
                  : 'bg-white/50 hover:bg-white/70'
              )}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                minWidth: isTouch ? '44px' : 'auto', // Minimum touch target size
                minHeight: isTouch ? '44px' : 'auto',
              }}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Swipe indicator for touch devices */}
      {isTouch && totalSlides > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
          Swipe to navigate
        </div>
      )}
    </div>
  )
}