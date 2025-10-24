import { getServerSession } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import * as argon2 from 'argon2'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions = {
  // Only use PrismaAdapter if we have a valid database connection
  ...(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder') && !process.env.DATABASE_URL.includes('build') 
    ? { adapter: PrismaAdapter(prisma) } 
    : {}),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Check if we have a valid database connection
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL.includes('build')) {
          throw new Error('Database not configured')
        }

        if (!credentials) return null
        
        const { email, password } = loginSchema.parse(credentials)
        
        const user = await prisma.user.findUnique({
          where: { email },
          include: { subscription: true }
        })
        
        if (!user || !await argon2.verify(user.passwordHash, password)) {
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in. Check your inbox for the verification link.')
        }
        
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        // Ensure the token carries the user's id (sub) so session.user.id can
        // be populated consistently in the session callback.
        if ((user as any).id) {
          token.sub = (user as any).id
        }
        if ((user as any).role) {
          token.role = (user as any).role
        }
      }
      return token
    },
    async session({ session, token }: any) {
      // Guard for session.user presence and populate id/role from token
      session.user = session.user || ({} as any)
      if (token.sub) {
        session.user.id = token.sub
      }
      if (token.role) {
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

export const auth = () => getServerSession(authOptions)

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user.role !== role && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return session
}