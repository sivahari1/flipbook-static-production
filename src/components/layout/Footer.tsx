'use client'

import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center">
            {/* Developer Credits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <p className="text-lg text-gray-300 mb-2">
                Designed and developed by
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
                <span className="text-white font-semibold text-lg">J. Siva Ramakrishna</span>
                <span className="hidden sm:inline text-gray-500">•</span>
                <span className="text-white font-semibold text-lg">R. Hariharan</span>
              </div>
            </motion.div>

            {/* Company Credits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-gray-400">
                Powered by <span className="text-blue-400 font-semibold">Deep Tech.Inc</span>
              </p>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-gray-700 pt-6">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} FlipBook DRM. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
              </motion.div>
            </div>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}