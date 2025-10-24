'use client'

import { HeroSection } from '@/components/landing/HeroSection'
import { FeatureCards } from '@/components/landing/FeatureCards'
import { DemoSection } from '@/components/landing/DemoSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { Shield, Lock, Users, BarChart3, Globe, Zap } from 'lucide-react'

const features = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Enterprise Security",
    description: "Military-grade encryption and multi-layered security protocols protect your documents from unauthorized access.",
    color: "blue"
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "DRM Protection",
    description: "Advanced Digital Rights Management prevents copying, printing, and unauthorized distribution of your content.",
    color: "purple"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Access Control",
    description: "Granular permissions and time-limited access ensure only authorized users can view your documents.",
    color: "green"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analytics Dashboard",
    description: "Real-time insights into document usage, user engagement, and security events.",
    color: "orange"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global CDN",
    description: "Fast, secure document delivery worldwide with 99.9% uptime guarantee.",
    color: "cyan"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Instant Deployment",
    description: "Get started in minutes with our simple API and comprehensive documentation.",
    color: "yellow"
  }
]

const heroButtons = [
  {
    text: "Start Free Trial",
    href: "/auth/register",
    variant: "primary" as const
  },
  {
    text: "View Demo",
    href: "#demo",
    variant: "secondary" as const
  }
]

export function HomePage() {
  return (
    <>
      <HeroSection
        title="Secure Document Sharing Made Simple"
        subtitle="Protect your PDFs with enterprise-grade security, dynamic watermarks, and granular access controls. Join thousands of professionals who trust our platform."
        ctaButtons={heroButtons}
        useTypewriter={true}
        typewriterSpeed={80}
      />
      
      <div id="features">
        <FeatureCards
          features={features}
          title="Why Choose Our Platform"
          subtitle="Discover the powerful features that make our platform the best choice for secure document sharing"
        />
      </div>
      
      <div id="demo">
        <DemoSection />
      </div>
      
      <div id="pricing">
        <PricingSection />
      </div>
      
      {/* Temporarily hidden - will be added later with real data */}
      {/* <TestimonialsSection /> */}
    </>
  )
}