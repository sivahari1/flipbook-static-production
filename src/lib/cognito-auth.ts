import { signUp, signIn, signOut, confirmSignUp, resendSignUpCode, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import { generateSecretHash, getCognitoConfig } from './cognito-secret-hash'
import './aws-config' // Import AWS config to ensure Amplify is configured

export interface CognitoUser {
  id: string
  email: string
  emailVerified: boolean
  attributes?: Record<string, any>
}

export class CognitoAuthService {
  // Sign up a new user
  static async signUp(username: string, password: string, attributes?: Record<string, string>) {
    try {
      console.log('🔄 Attempting Cognito sign up for username:', username)
      
      const config = getCognitoConfig()
      console.log('🔧 Using User Pool ID:', config.userPoolId)
      console.log('🔧 Using App Client ID:', config.clientId)
      console.log('🔧 Using Region:', config.region)
      console.log('🔧 Has Client Secret:', config.hasSecret)

      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: username,
        password,
        options: {
          userAttributes: {
            ...attributes,
          },
        },
      })
      
      console.log('✅ Cognito sign up successful:', { isSignUpComplete, userId, nextStep })

      return {
        success: true,
        isSignUpComplete,
        userId,
        nextStep,
        message: 'Sign up successful. Please check your email for verification code.',
      }
    } catch (error: any) {
      console.error('❌ Cognito sign up error:', error)
      
      // Check if it's the SECRET_HASH error
      if (error.message?.includes('SECRET_HASH')) {
        return {
          success: false,
          error: 'Configuration Error: Please disable client secret in AWS Cognito App Client settings, or add the client secret to your environment variables. See the fix guide for details.',
        }
      }
      
      return {
        success: false,
        error: error.message || 'Sign up failed',
      }
    }
  }

  // Confirm sign up with verification code
  static async confirmSignUp(username: string, confirmationCode: string) {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: username,
        confirmationCode,
      })

      if (isSignUpComplete) {
        // Create user in our database
        await this.syncUserToDatabase(username)
      }

      return {
        success: true,
        isSignUpComplete,
        nextStep,
        message: 'Email verified successfully!',
      }
    } catch (error: any) {
      console.error('Cognito confirm sign up error:', error)
      
      // Check if it's the SECRET_HASH error
      if (error.message?.includes('SECRET_HASH')) {
        return {
          success: false,
          error: 'Configuration Error: Please disable client secret in AWS Cognito App Client settings.',
        }
      }
      
      return {
        success: false,
        error: error.message || 'Email verification failed',
      }
    }
  }

  // Resend verification code
  static async resendConfirmationCode(username: string) {
    try {
      await resendSignUpCode({ username: username })
      return {
        success: true,
        message: 'Verification code sent to your email.',
      }
    } catch (error: any) {
      console.error('Cognito resend code error:', error)
      return {
        success: false,
        error: error.message || 'Failed to resend verification code',
      }
    }
  }

  // Sign in user
  static async signIn(username: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: username,
        password,
      })

      if (isSignedIn) {
        // Sync user data to our database
        await this.syncUserToDatabase(username)
      }

      return {
        success: true,
        isSignedIn,
        nextStep,
        message: 'Sign in successful!',
      }
    } catch (error: any) {
      console.error('Cognito sign in error:', error)
      
      // Check if it's the SECRET_HASH error
      if (error.message?.includes('SECRET_HASH')) {
        return {
          success: false,
          error: 'Configuration Error: Please disable client secret in AWS Cognito App Client settings. See the fix guide for details.',
        }
      }
      
      return {
        success: false,
        error: error.message || 'Sign in failed',
      }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      await signOut()
      return {
        success: true,
        message: 'Signed out successfully!',
      }
    } catch (error: any) {
      console.error('Cognito sign out error:', error)
      return {
        success: false,
        error: error.message || 'Sign out failed',
      }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      const user = await getCurrentUser()
      const session = await fetchAuthSession()
      
      return {
        id: user.userId,
        email: user.signInDetails?.loginId || '',
        emailVerified: true, // Cognito users are verified
        attributes: user.signInDetails,
      }
    } catch (error: any) {
      // Don't log authentication errors as they're expected for public pages
      if (error.name !== 'UserUnAuthenticatedException') {
        console.error('Get current user error:', error)
      }
      return null
    }
  }

  // Sync Cognito user to our database via API
  static async syncUserToDatabase(username: string) {
    try {
      const cognitoUser = await this.getCurrentUser()
      if (!cognitoUser) return null

      // Get email from Cognito user attributes
      const email = cognitoUser.email || cognitoUser.attributes?.email

      if (!email) {
        console.error('No email found for user:', username)
        return null
      }

      console.log('🔄 Syncing user to database:', email)
      
      // Call the sync-user API endpoint
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: cognitoUser.attributes?.name || email,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to sync user: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ User synced successfully:', result)
      return result.user
    } catch (error) {
      console.error('❌ Error syncing user to database:', error)
      // Don't throw error to prevent login failure
      return null
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return !!user
    } catch (error) {
      return false
    }
  }
}

export default CognitoAuthService