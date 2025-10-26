import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Get all documents
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        pageCount: true,
        storageKey: true,
        createdAt: true,
        owner: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      users,
      documents
    })

  } catch (error) {
    console.error('Error listing data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}