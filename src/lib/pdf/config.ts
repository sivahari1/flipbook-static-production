export const PDF_CONFIG = {
  // File size limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MIN_FILE_SIZE: 1024, // 1KB
  
  // Processing limits
  MAX_PAGES: 1000,
  MAX_CONCURRENT_JOBS: 2,
  PROCESSING_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Quality settings
  QUALITY_SETTINGS: {
    low: {
      dpi: 72,
      format: 'jpeg' as const,
      quality: 60,
      compression: 0.8
    },
    medium: {
      dpi: 150,
      format: 'png' as const,
      quality: 80,
      compression: 0.6
    },
    high: {
      dpi: 300,
      format: 'png' as const,
      quality: 95,
      compression: 0.4
    }
  },
  
  // Thumbnail settings
  THUMBNAIL_CONFIG: {
    width: 200,
    height: 280,
    quality: 80,
    format: 'jpeg' as const
  },
  
  // Text extraction settings
  TEXT_EXTRACTION: {
    enabled: true,
    timeout: 5 * 60 * 1000, // 5 minutes
    maxTextLength: 1024 * 1024, // 1MB of text per document
    languages: ['eng', 'spa', 'fra', 'deu'] // OCR languages if needed
  },
  
  // Cache settings
  CACHE_CONFIG: {
    ttl: 24 * 60 * 60, // 24 hours in seconds
    maxSize: 1000, // Max number of cached items
    preloadDistance: 2, // Pages to preload around current page
    compressionLevel: 6 // gzip compression level
  },
  
  // Queue settings
  QUEUE_CONFIG: {
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    jobTimeout: 30 * 60 * 1000, // 30 minutes
    cleanupInterval: 60 * 60 * 1000, // 1 hour
    maxCompletedJobs: 10,
    maxFailedJobs: 50
  },
  
  // Security settings
  SECURITY_CONFIG: {
    allowJavaScript: false,
    allowEmbeddedFiles: false,
    allowExternalLinks: true,
    maxPasswordAttempts: 3,
    scanForMalware: false // Would require additional service
  },
  
  // Storage settings
  STORAGE_CONFIG: {
    provider: 'local' as 'local' | 's3' | 'gcs',
    basePath: '/tmp/pdf-processing',
    cleanupAfter: 7 * 24 * 60 * 60 * 1000, // 7 days
    useCompression: true
  },
  
  // Watermark settings
  WATERMARK_CONFIG: {
    opacity: 0.1,
    fontSize: 12,
    color: '#000000',
    rotation: -45,
    positions: ['center', 'diagonal', 'corner'] as const,
    multiLayer: true
  },
  
  // Performance settings
  PERFORMANCE_CONFIG: {
    enableGPUAcceleration: false, // For future Canvas GPU rendering
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
    enableProgressiveLoading: true,
    enableLazyLoading: true
  },
  
  // API settings
  API_CONFIG: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // per window
    },
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_APP_URL] 
        : ['http://localhost:3000'],
      credentials: true
    }
  },
  
  // Monitoring settings
  MONITORING_CONFIG: {
    enableMetrics: true,
    enableLogging: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enablePerformanceTracking: true
  }
} as const

// Environment-specific overrides
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV
  
  if (env === 'production') {
    return {
      ...PDF_CONFIG,
      PROCESSING_TIMEOUT: 20 * 60 * 1000, // Shorter timeout in production
      QUEUE_CONFIG: {
        ...PDF_CONFIG.QUEUE_CONFIG,
        maxRetries: 2 // Fewer retries in production
      },
      MONITORING_CONFIG: {
        ...PDF_CONFIG.MONITORING_CONFIG,
        logLevel: 'error' as const
      }
    }
  }
  
  if (env === 'development') {
    return {
      ...PDF_CONFIG,
      MAX_FILE_SIZE: 50 * 1024 * 1024, // Smaller limit for development
      MAX_PAGES: 100, // Fewer pages for development
      PROCESSING_TIMEOUT: 10 * 60 * 1000, // Shorter timeout for development
    }
  }
  
  return PDF_CONFIG
}

// Helper functions
export const getQualityConfig = (quality: 'low' | 'medium' | 'high') => {
  return PDF_CONFIG.QUALITY_SETTINGS[quality]
}

export const getThumbnailConfig = () => {
  return PDF_CONFIG.THUMBNAIL_CONFIG
}

export const getCacheConfig = () => {
  return PDF_CONFIG.CACHE_CONFIG
}

export const getSecurityConfig = () => {
  return PDF_CONFIG.SECURITY_CONFIG
}

// Validation helpers
export const isValidQuality = (quality: string): quality is 'low' | 'medium' | 'high' => {
  return ['low', 'medium', 'high'].includes(quality)
}

export const isValidFormat = (format: string): format is 'png' | 'jpeg' | 'webp' => {
  return ['png', 'jpeg', 'webp'].includes(format)
}

export const getMaxFileSize = () => {
  return getEnvironmentConfig().MAX_FILE_SIZE
}

export const getMaxPages = () => {
  return getEnvironmentConfig().MAX_PAGES
}

export const getProcessingTimeout = () => {
  return getEnvironmentConfig().PROCESSING_TIMEOUT
}