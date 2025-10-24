#!/usr/bin/env node

// Build-time environment check script
// This ensures we have placeholder values for required environment variables during build

const requiredEnvVars = {
  'DATABASE_URL': 'postgresql://build:build@localhost:5432/build',
  'NEXTAUTH_SECRET': 'build-time-secret-placeholder-32chars',
  'NEXTAUTH_URL': 'http://localhost:3000'
}

console.log('🔍 Checking build-time environment variables...')

let hasChanges = false

for (const [key, defaultValue] of Object.entries(requiredEnvVars)) {
  if (!process.env[key]) {
    console.log(`⚠️  Setting placeholder for ${key}`)
    process.env[key] = defaultValue
    hasChanges = true
  } else {
    console.log(`✅ ${key} is set`)
  }
}

if (hasChanges) {
  console.log('📝 Placeholder environment variables set for build process')
} else {
  console.log('✅ All required environment variables are present')
}

console.log('🚀 Ready for build process')