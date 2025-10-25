// Database configuration utilities
export function isDatabaseConfigured(): boolean {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.log('📊 No DATABASE_URL found')
    return false
  }
  
  // Check for placeholder values that indicate unconfigured database
  const placeholderValues = ['placeholder', 'build', 'localhost:5432/placeholder']
  const isPlaceholder = placeholderValues.some(placeholder => 
    databaseUrl.includes(placeholder)
  )
  
  if (isPlaceholder) {
    console.log('📊 DATABASE_URL contains placeholder values')
    return false
  }
  
  // Check for valid database URL patterns
  const validPatterns = [
    /^postgresql:\/\//, // PostgreSQL (Supabase)
    /^postgres:\/\//, // PostgreSQL alternative
    /^mysql:\/\//, // MySQL
    /^sqlite:/, // SQLite
  ]
  
  const isValidUrl = validPatterns.some(pattern => pattern.test(databaseUrl))
  
  if (!isValidUrl) {
    console.log('📊 DATABASE_URL does not match valid patterns')
    return false
  }
  
  console.log('✅ Database appears to be configured:', databaseUrl.substring(0, 20) + '...')
  return true
}

export function getDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    return {
      configured: false,
      type: 'none',
      provider: 'none'
    }
  }
  
  let type = 'unknown'
  let provider = 'unknown'
  
  if (databaseUrl.includes('supabase')) {
    type = 'postgresql'
    provider = 'supabase'
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    type = 'postgresql'
    provider = 'postgresql'
  } else if (databaseUrl.startsWith('mysql://')) {
    type = 'mysql'
    provider = 'mysql'
  } else if (databaseUrl.startsWith('sqlite:')) {
    type = 'sqlite'
    provider = 'sqlite'
  }
  
  return {
    configured: isDatabaseConfigured(),
    type,
    provider,
    url: databaseUrl.substring(0, 20) + '...'
  }
}