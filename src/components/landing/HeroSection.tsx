'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { TypewriterText } from '@/components/animations/TypewriterText'
import { getAnimationVariants } from '@/lib/animations'
import { useAccessibilityContext } from '@/contexts/AccessibilityContext'
import { AccessibleMotionDiv } from '@/components/animations/AccessibleMotion'
import { AccessibleButton } from '@/components/ui/accessible-button'

interface CTAButton {
  text: string
  href: string
  variant: 'primary' | 'secondary'
}

interface HeroSectionProps {
  title: string
  subtitle: string
  ctaButtons: CTAButton[]
  useTypewriter?: boolean
  typewriterSpeed?: number
}

export function HeroSection({ 
  title, 
  subtitle, 
  ctaButtons,
  useTypewriter = false,
  typewriterSpeed = 100
}: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const { config, preferences } = useAccessibilityContext()
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  // Disable parallax if reduced motion is preferred
  const y = useTransform(scrollYProgress, [0, 1], config.enableParallax ? [0, -100] : [0, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3])

  const containerVariants = getAnimationVariants({
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  })

  const titleVariants = getAnimationVariants({
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
        duration: 0.6,
        ease: [0.0, 0.0, 0.2, 1],
      },
    },
  })

  const subtitleVariants = getAnimationVariants({
    hidden: { 
      opacity: 0,
      y: 20,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.0, 0.0, 0.2, 1],
      },
    },
  })

  const buttonVariants = getAnimationVariants({
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.0, 0.0, 0.2, 1],
      },
    },
  })

  return (
    <section 
      ref={ref} 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section with main heading and call-to-action buttons"
      role="banner"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Floating Particles - Hidden from screen readers */}
        <div className="absolute inset-0" aria-hidden="true">
          {config.enableAnimations && [...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full opacity-20 ${
                i % 3 === 0 ? 'w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500' :
                i % 3 === 1 ? 'w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500' :
                'w-1 h-1 bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              animate={config.enableAnimations ? {
                x: [0, Math.random() * 200 - 100, 0],
                y: [0, Math.random() * 200 - 100, 0],
                scale: [1, 1.5 + Math.random() * 0.5, 1],
                rotate: [0, 360],
              } : {}}
              transition={{
                duration: config.enableAnimations ? (10 + Math.random() * 10) * config.animationDuration : 0,
                repeat: config.enableAnimations ? Infinity : 0,
                ease: "easeInOut",
                delay: config.enableAnimations ? i * 0.3 : 0,
              }}
              style={{
                left: `${5 + (i * 8) % 90}%`,
                top: `${10 + (i * 7) % 80}%`,
              }}
            />
          ))}
        </div>

        {/* Gradient Orbs - Hidden from screen readers */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 blur-3xl"
          animate={config.enableAnimations ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          } : {}}
          transition={{
            duration: config.enableAnimations ? 4 * config.animationDuration : 0,
            repeat: config.enableAnimations ? Infinity : 0,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-20 blur-2xl"
          animate={config.enableAnimations ? {
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          } : {}}
          transition={{
            duration: config.enableAnimations ? 6 * config.animationDuration : 0,
            repeat: config.enableAnimations ? Infinity : 0,
            ease: "easeInOut",
            delay: config.enableAnimations ? 1 : 0,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <AccessibleMotionDiv
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={config.enableParallax ? { y, opacity } : { opacity }}
        className="relative z-10 container mx-auto px-4 py-16 text-center max-w-5xl"
        ariaLabel="Main hero content"
      >
        {/* Title */}
        <AccessibleMotionDiv
          variants={titleVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          role="heading"
          aria-level={1}
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {useTypewriter && config.enableAnimations ? (
              <TypewriterText 
                text={title}
                speed={typewriterSpeed}
                delay={500}
                showCursor={true}
                staggered={true}
                characterDelay={50}
              />
            ) : (
              title
            )}
          </span>
        </AccessibleMotionDiv>

        {/* Subtitle */}
        <AccessibleMotionDiv
          variants={subtitleVariants}
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          role="text"
          aria-describedby="hero-subtitle"
        >
          <span id="hero-subtitle">{subtitle}</span>
        </AccessibleMotionDiv>

        {/* CTA Buttons */}
        <AccessibleMotionDiv
          variants={buttonVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          role="group"
          aria-label="Call to action buttons"
        >
          {ctaButtons.map((button, index) => (
            <AccessibleButton
              key={index}
              variant={button.variant}
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-full"
              ariaLabel={`${button.text} - ${button.variant === 'primary' ? 'Primary action' : 'Secondary action'}`}
              announceOnClick={`Navigating to ${button.text}`}
              motionProps={{
                whileHover: config.enableAnimations ? { 
                  scale: 1.05,
                  y: -2,
                } : undefined,
                whileTap: config.enableAnimations ? { scale: 0.95 } : undefined,
                transition: { type: "spring", stiffness: 400, damping: 17 }
              }}
            >
              <Link href={button.href} className="relative z-10">
                {button.text}
              </Link>
            </AccessibleButton>
          ))}
        </AccessibleMotionDiv>

        {/* Scroll Indicator */}
        <AccessibleMotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.enableAnimations ? 1.5 : 0, duration: config.enableAnimations ? 0.5 : 0.01 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          ariaLabel="Scroll down indicator"
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
            }
          }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <AccessibleMotionDiv
            animate={config.enableAnimations ? { y: [0, 10, 0] } : {}}
            transition={{ 
              duration: config.enableAnimations ? 2 * config.animationDuration : 0, 
              repeat: config.enableAnimations ? Infinity : 0, 
              ease: "easeInOut" 
            }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center cursor-pointer hover:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-hidden="true"
          >
            <AccessibleMotionDiv
              animate={config.enableAnimations ? { y: [0, 12, 0] } : {}}
              transition={{ 
                duration: config.enableAnimations ? 2 * config.animationDuration : 0, 
                repeat: config.enableAnimations ? Infinity : 0, 
                ease: "easeInOut" 
              }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            >
              <div />
            </AccessibleMotionDiv>
          </AccessibleMotionDiv>
          <span className="sr-only">Scroll down to see more content</span>
        </AccessibleMotionDiv>
      </AccessibleMotionDiv>
    </section>
  )
}