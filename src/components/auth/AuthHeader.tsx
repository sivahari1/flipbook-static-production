'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AuthHeaderProps {
  showBackButton?: boolean
  backHref?: string
}

export function AuthHeader({ showBackButton = true, backHref = '/' }: AuthHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {showBackButton && (
        <Link 
          href={backHref}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      )}
      
      <Link href="/" className="flex items-center space-x-2 ml-auto">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <span className="text-xl font-bold text-gray-900">FlipBook DRM</span>
      </Link>
    </div>
  )
}