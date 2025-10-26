#!/usr/bin/env node

// Amplify environment setup script
// This ensures we have the minimum required environment variables for build

console.log('🔧 Setting up Amplify build environment...')

// Set default environment variables if not provided
const defaults = {
  'DATABASE_URL': 'postgresql://build:build@localhost:5432/build',
  'NEXTAUTH_SECRET': 'build-time-secret-placeholder-32chars-long-enough',
  'NEXTAUTH_URL': 'https://main.d39m2583vv0xam.amplifyapp.com',
  'NODE_ENV': 'production',
  'NEXT_PUBLIC_APP_URL': 'https://main.d39m2583vv0xam.amplifyapp.com'
}

let envSet = 0
for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value
    console.log(`✅ Set ${key}`)
    envSet++
  }
}

console.log(`🚀 Environment setup complete! Set ${envSet} default values.`)
process.exit(0)