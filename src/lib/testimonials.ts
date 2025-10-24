export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar?: string
  rating: number
}

export const testimonialsData: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Legal Director',
    company: 'Morrison & Associates',
    content: 'The security features are exactly what we needed for sharing confidential legal documents. The watermarking and access controls give us complete peace of mind.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'CTO',
    company: 'TechFlow Solutions',
    content: 'Implementation was seamless and the analytics dashboard provides incredible insights into document engagement. Our team productivity has increased significantly.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'Marketing Manager',
    company: 'Creative Studios Inc',
    content: 'The flipbook presentation format makes our proposals stand out. Clients love the interactive experience and we can track their engagement in real-time.',
    rating: 5,
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Financial Advisor',
    company: 'Wealth Management Pro',
    content: 'Perfect for sharing sensitive financial reports with clients. The time-limited access and IP restrictions ensure our compliance requirements are met.',
    rating: 5,
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'HR Director',
    company: 'Global Enterprises',
    content: 'Sharing employee handbooks and training materials has never been easier. The view-only access prevents unauthorized distribution of our content.',
    rating: 5,
  },
]

export const customerLogos = [
  {
    name: 'TechFlow Solutions',
    logo: '/logos/techflow.svg',
  },
  {
    name: 'Morrison & Associates',
    logo: '/logos/morrison.svg',
  },
  {
    name: 'Creative Studios Inc',
    logo: '/logos/creative-studios.svg',
  },
  {
    name: 'Wealth Management Pro',
    logo: '/logos/wealth-pro.svg',
  },
  {
    name: 'Global Enterprises',
    logo: '/logos/global-enterprises.svg',
  },
]

export const trustIndicators = [
  {
    label: 'Documents Protected',
    value: 50000,
    suffix: '+',
  },
  {
    label: 'Active Users',
    value: 2500,
    suffix: '+',
  },
  {
    label: 'Enterprise Clients',
    value: 150,
    suffix: '+',
  },
  {
    label: 'Uptime',
    value: 99.9,
    suffix: '%',
  },
]