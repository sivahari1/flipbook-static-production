export interface PricingFeature {
  name: string
  included: boolean
  limit?: number
  description?: string
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  pricing: {
    monthly: number
    yearly: number
    yearlyDiscount?: number
  }
  features: PricingFeature[]
  popular: boolean
  color: {
    primary: string
    secondary: string
    gradient: string
  }
  ctaText?: string
  stripeProductId?: string
  stripePriceIds?: {
    monthly: string
    yearly: string
  }
  limits: {
    documents?: number
    storage?: string
    users?: number
    apiCalls?: number
  }
}

export const subscriptionPlans: PricingPlan[] = [
  {
    id: 'free-trial',
    name: '7-Day Free Trial',
    description: 'One week of unlimited access to all premium features - no credit card required',
    pricing: {
      monthly: 0, // Free for 7 days
      yearly: 0, // Free for 7 days
      yearlyDiscount: 0,
    },
    features: [
      { 
        name: '🎉 Full 7 days completely FREE', 
        included: true,
        description: 'Experience all premium features for an entire week'
      },
      { 
        name: 'All premium features unlocked', 
        included: true,
        description: 'Access every feature available in our paid plans'
      },
      { 
        name: 'Secure document uploads', 
        included: true,
        description: 'Upload and encrypt your documents with military-grade security'
      },
      { 
        name: 'Advanced watermarking', 
        included: true,
        description: 'Dynamic watermarks with user info and timestamps'
      },
      { 
        name: 'Advanced security features', 
        included: true,
        description: 'IP restrictions, device limits, and access controls'
      },
      { 
        name: 'Detailed analytics', 
        included: true,
        description: 'Advanced reporting and user behavior insights'
      },
      { 
        name: 'Priority email support', 
        included: true,
        description: 'Get help when you need it via email'
      },
      { 
        name: '❌ No credit card required', 
        included: true,
        description: 'Start immediately without any payment information'
      },
      { 
        name: '✅ Cancel anytime', 
        included: true,
        description: 'No commitment, cancel before trial ends'
      },
    ],
    popular: true,
    color: {
      primary: '#10B981',
      secondary: '#6EE7B7',
      gradient: 'linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)',
    },
    ctaText: 'Start 7-Day Free Trial',
    stripeProductId: 'prod_free_trial',
    stripePriceIds: {
      monthly: 'price_free_trial',
      yearly: 'price_free_trial',
    },
    limits: {
      documents: 25, // Increased for trial
      storage: '5GB', // Increased for trial
      users: 1,
      apiCalls: 1000, // Increased for trial
    },
  },
  {
    id: 'monthly',
    name: '1 Month Plan',
    description: 'Perfect for regular users and small businesses with ongoing document needs',
    pricing: {
      monthly: 1999, // ₹1,999 for 1 month
      yearly: 1999, // Same price for monthly plan
      yearlyDiscount: 0,
    },
    features: [
      { 
        name: 'All premium features included', 
        included: true,
        description: 'Complete access to all FlipBook DRM features'
      },
      { 
        name: 'Advanced watermarking', 
        included: true,
        description: 'Dynamic watermarks with user info and timestamps'
      },
      { 
        name: 'Advanced security features', 
        included: true,
        description: 'IP restrictions, device limits, and access controls'
      },
      { 
        name: 'Detailed analytics', 
        included: true,
        description: 'Advanced reporting and user behavior insights'
      },
      { 
        name: 'Priority support', 
        included: true,
        description: 'Faster response times and phone support'
      },
      { 
        name: 'Team collaboration', 
        included: true,
        description: 'Share documents within your team securely'
      },
      { 
        name: 'API access', 
        included: true,
        description: 'Basic REST API access for integrations'
      },
      { 
        name: 'Custom branding', 
        included: false,
        description: 'White-label the viewer with your brand'
      },
    ],
    popular: true,
    color: {
      primary: '#3B82F6',
      secondary: '#93C5FD',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #93C5FD 100%)',
    },
    ctaText: 'Get 1 Month Access',
    stripeProductId: 'prod_monthly',
    stripePriceIds: {
      monthly: 'price_monthly',
      yearly: 'price_monthly',
    },
    limits: {
      documents: 50,
      storage: '5GB',
      users: 3,
      apiCalls: 1000,
    },
  },
  {
    id: 'quarterly',
    name: '3 Months Plan',
    description: 'Perfect for medium-term projects and growing businesses',
    pricing: {
      monthly: 4999, // ₹4,999 for 3 months
      yearly: 4999, // Same price for quarterly plan
      yearlyDiscount: 0,
    },
    features: [
      { 
        name: 'Everything in 1 Month Plan', 
        included: true,
        description: 'All features from the 1 Month plan included'
      },
      { 
        name: 'Custom branding', 
        included: true,
        description: 'White-label the viewer with your brand'
      },
      { 
        name: 'Advanced API access', 
        included: true,
        description: 'Complete REST API with webhooks and integrations'
      },
      { 
        name: 'Team collaboration', 
        included: true,
        description: 'Advanced team features and user management'
      },
      { 
        name: 'Priority support', 
        included: true,
        description: 'Dedicated support with faster response times'
      },
      { 
        name: 'Advanced analytics', 
        included: true,
        description: 'Detailed reporting and user behavior insights'
      },
      { 
        name: 'Bulk operations', 
        included: true,
        description: 'Upload and manage multiple documents at once'
      },
      { 
        name: 'Export capabilities', 
        included: true,
        description: 'Export analytics and user data'
      },
    ],
    popular: false,
    color: {
      primary: '#8B5CF6',
      secondary: '#C4B5FD',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%)',
    },
    ctaText: 'Get 3 Months Access',
    stripeProductId: 'prod_quarterly',
    stripePriceIds: {
      monthly: 'price_quarterly',
      yearly: 'price_quarterly',
    },
    limits: {
      documents: 200,
      storage: '10GB',
      users: 10,
      apiCalls: 5000,
    },
  },
  {
    id: 'biannual',
    name: '6 Months Plan',
    description: 'Great value for established businesses and long-term projects',
    pricing: {
      monthly: 8999, // ₹8,999 for 6 months
      yearly: 8999, // Same price for biannual plan
      yearlyDiscount: 0,
    },
    features: [
      { 
        name: 'Everything in 3 Months Plan', 
        included: true,
        description: 'All features from the 3 Months plan included'
      },
      { 
        name: 'Advanced security suite', 
        included: true,
        description: 'Enhanced encryption, audit logs, and compliance tools'
      },
      { 
        name: 'SSO integration', 
        included: true,
        description: 'Single sign-on with your existing systems'
      },
      { 
        name: 'Custom analytics dashboard', 
        included: true,
        description: 'Build custom reports and dashboards'
      },
      { 
        name: 'Dedicated account manager', 
        included: true,
        description: 'Personal support and guidance'
      },
      { 
        name: 'Advanced integrations', 
        included: true,
        description: 'Connect with CRM, ERP, and other business tools'
      },
      { 
        name: 'White-label solutions', 
        included: true,
        description: 'Complete branding customization'
      },
      { 
        name: 'Priority feature requests', 
        included: true,
        description: 'Influence product roadmap and get custom features'
      },
    ],
    popular: false,
    color: {
      primary: '#F59E0B',
      secondary: '#FCD34D',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
    },
    ctaText: 'Get 6 Months Access',
    stripeProductId: 'prod_biannual',
    stripePriceIds: {
      monthly: 'price_biannual',
      yearly: 'price_biannual',
    },
    limits: {
      documents: 500,
      storage: '50GB',
      users: 25,
      apiCalls: 15000,
    },
  },
  {
    id: 'annual',
    name: '12 Months Plan',
    description: 'Best value for enterprises and organizations with extensive document needs',
    pricing: {
      monthly: 14999, // ₹14,999 for 12 months (Best Value!)
      yearly: 14999, // Same price for annual plan
      yearlyDiscount: 0,
    },
    features: [
      { 
        name: 'Everything in 6 Months Plan', 
        included: true,
        description: 'All features from the 6 Months plan included'
      },
      { 
        name: 'Unlimited documents', 
        included: true,
        description: 'No limits on document uploads'
      },
      { 
        name: 'Enterprise security suite', 
        included: true,
        description: 'Military-grade security with compliance certifications'
      },
      { 
        name: 'On-premise deployment', 
        included: true,
        description: 'Deploy on your own infrastructure if needed'
      },
      { 
        name: 'Custom integrations', 
        included: true,
        description: 'We\'ll build custom integrations for your workflow'
      },
      { 
        name: '24/7 dedicated support', 
        included: true,
        description: 'Round-the-clock support with guaranteed response times'
      },
      { 
        name: 'Training and onboarding', 
        included: true,
        description: 'Complete team training and setup assistance'
      },
      { 
        name: 'SLA guarantee', 
        included: true,
        description: '99.9% uptime guarantee with service credits'
      },
    ],
    popular: false,
    color: {
      primary: '#DC2626',
      secondary: '#FCA5A5',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #FCA5A5 100%)',
    },
    ctaText: 'Get 12 Months Access',
    stripeProductId: 'prod_annual',
    stripePriceIds: {
      monthly: 'price_annual',
      yearly: 'price_annual',
    },
    limits: {
      documents: -1, // unlimited
      storage: '100GB',
      users: -1, // unlimited
      apiCalls: -1, // unlimited
    },
  },
]

// Helper function to get plan by ID
export function getPlanById(planId: string): PricingPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === planId)
}

// Helper function to get Stripe price ID for a plan and billing cycle
export function getStripePriceId(planId: string, billingCycle: 'monthly' | 'yearly'): string | undefined {
  const plan = getPlanById(planId)
  return plan?.stripePriceIds?.[billingCycle]
}

// Helper function to calculate savings for yearly plans
export function calculateYearlySavings(plan: PricingPlan): number {
  const monthlyTotal = plan.pricing.monthly * 12
  const yearlyTotal = plan.pricing.yearly
  return monthlyTotal - yearlyTotal
}