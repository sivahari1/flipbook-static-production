'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  href: string
}

interface SmoothScrollNavProps {
  items: NavItem[]
  className?: string
  activeColor?: string
  inactiveColor?: string
  showProgress?: boolean
  offset?: number
}

interface ScrollSpyProps {
  sections: string[]
  offset?: number
  onActiveChange?: (activeSection: string) => void
}

export function SmoothScrollNav({
  items,
  className = '',
  activeColor = 'text-blue-600',
  inactiveColor = 'text-gray-600',
  showProgress = false,
  offset = 80
}: SmoothScrollNavProps) {
  const [activeSection, setActiveSection] = useState('')
  const { scrollY } = useScroll()

  useEffect(() => {
    const updateActiveSection = () => {
      const sections = items.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      })).filter(section => section.element)

      let current = ''
      
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          if (rect.top <= offset && rect.bottom >= offset) {
            current = section.id
            break
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current)
      }
    }

    const unsubscribe = scrollY.on('change', updateActiveSection)
    updateActiveSection() // Initial check

    return () => unsubscribe()
  }, [scrollY, items, activeSection, offset])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav className={cn('flex flex-col space-y-2', className)}>
      {items.map((item) => {
        const isActive = activeSection === item.id
        
        return (
          <motion.button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              'text-left px-4 py-2 rounded-lg transition-colors duration-200 relative',
              isActive ? activeColor : inactiveColor,
              'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
            {showProgress && isActive && (
              <motion.div
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-200"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}

export function ScrollSpy({ sections, offset = 80, onActiveChange }: ScrollSpyProps) {
  const [activeSection, setActiveSection] = useState('')
  const { scrollY } = useScroll()

  useEffect(() => {
    const updateActiveSection = () => {
      const sectionElements = sections.map(id => ({
        id,
        element: document.getElementById(id)
      })).filter(section => section.element)

      let current = ''
      
      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          if (rect.top <= offset && rect.bottom >= offset) {
            current = section.id
            break
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current)
        if (onActiveChange) {
          onActiveChange(current)
        }
      }
    }

    const unsubscribe = scrollY.on('change', updateActiveSection)
    updateActiveSection()

    return () => unsubscribe()
  }, [scrollY, sections, activeSection, offset, onActiveChange])

  return activeSection
}

// Floating navigation component
export function FloatingNav({
  items,
  className = '',
  showOnScroll = true
}: {
  items: NavItem[]
  className?: string
  showOnScroll?: boolean
}) {
  const [isVisible, setIsVisible] = useState(!showOnScroll)
  const { scrollY } = useScroll()
  const prevScrollY = useRef(0)

  useEffect(() => {
    if (!showOnScroll) return

    const updateVisibility = () => {
      const currentScrollY = scrollY.get()
      
      if (currentScrollY > 100) {
        if (currentScrollY < prevScrollY.current) {
          // Scrolling up
          setIsVisible(true)
        } else {
          // Scrolling down
          setIsVisible(false)
        }
      } else {
        setIsVisible(false)
      }
      
      prevScrollY.current = currentScrollY
    }

    const unsubscribe = scrollY.on('change', updateVisibility)
    return () => unsubscribe()
  }, [scrollY, showOnScroll])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.nav
      className={cn(
        'fixed top-1/2 right-4 -translate-y-1/2 z-50',
        'bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg',
        'dark:bg-gray-900/90 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, x: 100 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : 100
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="p-2 space-y-1">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="block w-3 h-3 rounded-full bg-gray-300 hover:bg-blue-500 transition-colors duration-200"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            title={item.label}
          />
        ))}
      </div>
    </motion.nav>
  )
}

// Hook for smooth scrolling functionality
export function useSmoothScroll(offset: number = 80) {
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return {
    scrollToElement,
    scrollToTop
  }
}