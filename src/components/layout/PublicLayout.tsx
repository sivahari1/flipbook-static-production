'use client'

import { PublicHeader } from '@/components/layout/PublicHeader'
import { Footer } from '@/components/layout/Footer'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <AccessibilityProvider>
      <PublicHeader />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </AccessibilityProvider>
  )
}