import type { Metadata } from 'next'
import './globals.static.css'

export const metadata: Metadata = {
  title: 'FlipBook DRM - Enterprise Document Protection',
  description: 'Secure, enterprise-grade document protection platform with advanced DRM features, real-time monitoring, and cross-platform support.',
  keywords: 'DRM, document protection, enterprise security, PDF protection, document security',
  authors: [{ name: 'FlipBook DRM Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}