import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || 'ap-south-1_50Swd6FZ8',
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID || '7rtjr616o08g86r000cughej87',
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
      signUpVerificationMethod: 'email' as const,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
}

// Configure Amplify
try {
  Amplify.configure(awsConfig)
  console.log('✅ AWS Amplify configured successfully')
} catch (error) {
  console.error('❌ AWS Amplify configuration error:', error)
}

export default awsConfig