import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.minimal.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flipbook DRM - Secure PDF Platform',
  description: 'Secure, view-only PDF sharing with advanced DRM protection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}