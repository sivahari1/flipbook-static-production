#!/usr/bin/env node

// Simplified environment setup for Amplify
console.log('🔧 Setting up simplified build environment...')

// Minimal environment variables
process.env.NODE_ENV = 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'

console.log('✅ Environment setup complete!')
process.exit(0)