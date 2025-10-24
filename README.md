# FlipBook DRM - Document Protection Platform

A secure document management and protection platform built with Next.js, featuring advanced DRM capabilities, user authentication, and payment processing.

## 🚀 Features

- **Document Protection**: Advanced DRM with watermarking and access controls
- **User Authentication**: AWS Cognito integration with secure session management
- **Payment Processing**: Razorpay integration for subscription management
- **Modern UI**: Animated, responsive interface with accessibility support
- **Security**: 15-minute idle timeout, encrypted document storage
- **Analytics**: Document viewing and user engagement tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: AWS Cognito
- **Payments**: Razorpay
- **Deployment**: AWS Amplify
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS Cognito User Pool
- Razorpay account

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd flipbook-drm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.production.example .env.local
   # Fill in your actual values
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### AWS Amplify (Recommended)

1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Configure environment variables
4. Deploy automatically

See [DEPLOY_TO_AWS_AMPLIFY.md](./DEPLOY_TO_AWS_AMPLIFY.md) for detailed instructions.

## 📚 Documentation

- [AWS Amplify Deployment Guide](./DEPLOY_TO_AWS_AMPLIFY.md)
- [Idle Timeout Implementation](./IDLE_TIMEOUT_IMPLEMENTATION.md)
- [Accessibility Features](./ACCESSIBILITY.md)

## 🔐 Security Features

- AWS Cognito authentication
- 15-minute idle timeout
- Document encryption
- Access control and permissions
- Secure file sharing

## 💳 Subscription Plans

- **Free Trial**: 7 days full access
- **Monthly**: ₹1,999/month
- **Quarterly**: ₹4,999/3 months  
- **Biannual**: ₹8,999/6 months
- **Annual**: ₹14,999/year

## 📄 License

Private - All rights reserved

## 🤝 Support

For support and questions, please contact the development team.
