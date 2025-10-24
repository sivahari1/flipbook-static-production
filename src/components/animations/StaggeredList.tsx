'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StaggeredListProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
  itemClassName?: string
}

export function StaggeredList({ 
  children, 
  staggerDelay = 0.2,
  className = '',
  itemClassName = ''
}: StaggeredListProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.0, 0.0, 0.2, 1],
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}