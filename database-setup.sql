-- FlipBook DRM Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT,
    role TEXT NOT NULL DEFAULT 'SUBSCRIBER',
    "emailVerified" BOOLEAN DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS "Document" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "ownerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "storageKey" TEXT NOT NULL,
    "tilePrefix" TEXT,
    "drmOptions" TEXT,
    "hasPassphrase" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "Subscription" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "planId" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (for NextAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

-- Sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- Verification tokens table (for NextAuth)
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "Document_ownerId_idx" ON "Document"("ownerId");
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Insert a test user (optional)
INSERT INTO "User" (email, role, "emailVerified") 
VALUES ('test@example.com', 'SUBSCRIBER', true) 
ON CONFLICT (email) DO NOTHING;

COMMIT;