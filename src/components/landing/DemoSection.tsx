'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ScrollTrigger } from '@/components/animations'
import { SecurityDemo } from './demos/SecurityDemo'
import { SharingDemo } from './demos/SharingDemo'
import { WatermarkDemo } from './demos/WatermarkDemo'
import { PDFProtectionDemo } from './demos/PDFProtectionDemo'
import { Shield, Link2, FileText, Lock } from 'lucide-react'

interface DemoItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  demo: React.ReactNode
}

interface DemoSectionProps {
  demos?: DemoItem[]
}

export function DemoSection({ demos: propDemos }: DemoSectionProps) {
  const defaultDemos: DemoItem[] = [
    {
      id: 'security',
      title: 'Security Pipeline',
      description: 'See how our multi-layered security system protects your documents from upload to access',
      icon: <Shield className="w-6 h-6" />,
      demo: <SecurityDemo />
    },
    {
      id: 'pdf-protection',
      title: 'PDF Protection Levels',
      description: 'Experience different levels of document protection from basic to enterprise-grade security',
      icon: <Lock className="w-6 h-6" />,
      demo: <PDFProtectionDemo />
    },
    {
      id: 'sharing',
      title: 'Smart Sharing Workflow',
      description: 'Create secure, time-limited links with granular access controls and real-time monitoring',
      icon: <Link2 className="w-6 h-6" />,
      demo: <SharingDemo />
    },
    {
      id: 'watermarks',
      title: 'Dynamic Watermarks',
      description: 'Explore our advanced watermarking system with real-time user identification and screenshot protection',
      icon: <FileText className="w-6 h-6" />,
      demo: <WatermarkDemo />
    }
  ]

  const demos = propDemos || defaultDemos
  const [activeDemo, setActiveDemo] = useState(demos[0]?.id || '')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { 
      opacity: 0,
      x: -30,
    },
    visible: { 
      opacity: 1,
      x: 0,
    },
  }

  const demoVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
    },
    visible: { 
      opacity: 1,
      scale: 1,
    },
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollTrigger className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our powerful security features through interactive demonstrations
          </p>
        </ScrollTrigger>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Navigation */}
            <ScrollTrigger>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {demos.map((demo) => (
                  <motion.div
                    key={demo.id}
                    variants={itemVariants}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`
                      p-6 rounded-xl cursor-pointer transition-all duration-300
                      ${activeDemo === demo.id 
                        ? 'bg-gradient-primary text-white shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }
                    `}
                    onClick={() => setActiveDemo(demo.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                        ${activeDemo === demo.id ? 'bg-white/20' : 'bg-blue-100'}
                      `}>
                        <div className={`w-6 h-6 ${activeDemo === demo.id ? 'text-white' : 'text-blue-600'}`}>
                          {demo.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {demo.title}
                        </h3>
                        <p className={`text-sm ${activeDemo === demo.id ? 'text-white/90' : 'text-gray-600'}`}>
                          {demo.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollTrigger>

            {/* Demo Display */}
            <ScrollTrigger>
              <motion.div
                key={activeDemo}
                variants={demoVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-gray-50 rounded-2xl p-8 min-h-[400px] flex items-center justify-center"
              >
                {demos.find(demo => demo.id === activeDemo)?.demo || (
                  <div className="text-center text-gray-500">
                    Select a feature to see the demo
                  </div>
                )}
              </motion.div>
            </ScrollTrigger>
          </div>
        </div>
      </div>
    </section>
  )
}