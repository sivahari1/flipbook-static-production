import Redis from 'redis'

let redis: Redis.RedisClientType | null = null

function getRedisClient(): Redis.RedisClientType {
  if (!redis) {
    redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    redis.connect().catch(console.error)
  }
  return redis
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const window = Math.floor(now / windowMs)
  const redisKey = `rate_limit:${key}:${window}`

  try {
    const redisClient = getRedisClient()
    const current = await redisClient.incr(redisKey)
    
    if (current === 1) {
      await redisClient.expire(redisKey, Math.ceil(windowMs / 1000))
    }

    const remaining = Math.max(0, limit - current)
    const resetTime = (window + 1) * windowMs

    return {
      success: current <= limit,
      remaining,
      resetTime
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if Redis is down
    return {
      success: true,
      remaining: limit,
      resetTime: now + windowMs
    }
  }
}

export async function setTokenBucket(
  key: string,
  tokens: number,
  refillRate: number,
  maxTokens: number
): Promise<boolean> {
  const now = Date.now()
  const bucketKey = `bucket:${key}`
  
  try {
    const redisClient = getRedisClient()
    const bucket = await redisClient.hGetAll(bucketKey)
    
    let currentTokens = parseFloat(bucket.tokens || maxTokens.toString())
    const lastRefill = parseInt(bucket.lastRefill || now.toString())
    
    // Refill tokens based on time elapsed
    const timeDelta = (now - lastRefill) / 1000
    currentTokens = Math.min(maxTokens, currentTokens + (timeDelta * refillRate))
    
    if (currentTokens >= tokens) {
      currentTokens -= tokens
      
      await redisClient.hSet(bucketKey, {
        tokens: currentTokens.toString(),
        lastRefill: now.toString()
      })
      
      await redisClient.expire(bucketKey, 3600) // 1 hour TTL
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('Token bucket error:', error)
    return true // Fail open
  }
}