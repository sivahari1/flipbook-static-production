import crypto from 'crypto'

/**
 * Generate SECRET_HASH for AWS Cognito
 * This is required when the Cognito App Client has a secret configured
 */
export function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
  const message = username + clientId
  const hash = crypto.createHmac('sha256', clientSecret).update(message).digest('base64')
  return hash
}

/**
 * Get Cognito configuration with proper secret handling
 */
export function getCognitoConfig() {
  const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || 'ap-south-1_50Swd6FZ8'
  const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID || '7rtjr616o08g86r000cughej87'
  const clientSecret = process.env.AWS_COGNITO_CLIENT_SECRET
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1'

  return {
    userPoolId,
    clientId,
    clientSecret,
    region,
    hasSecret: !!clientSecret
  }
}