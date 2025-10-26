import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export class DatabaseMigrations {
  private prisma = prisma

  async runPDFExtensionsMigration(): Promise<void> {
    try {
      console.log('Running PDF extensions migration with Prisma...')
      
      // Generate Prisma client with new schema
      console.log('Generating Prisma client...')
      execSync('npx prisma generate', { stdio: 'inherit' })
      
      // Create and apply migration
      console.log('Creating migration...')
      execSync('npx prisma migrate dev --name add-pdf-processing-tables', { stdio: 'inherit' })
      
      console.log('PDF extensions migration completed successfully!')
      
    } catch (error) {
      console.error('Failed to run PDF extensions migration:', error)
      throw error
    }
  }

  async checkMigrationStatus(): Promise<{
    tablesExist: boolean
    missingTables: string[]
  }> {
    const requiredTables = [
      'pdf_pages',
      'document_text_search', 
      'pdf_processing_jobs',
      'document_access_logs'
    ]
    
    const missingTables: string[] = []
    
    try {
      // Check if tables exist by trying to query them
      for (const table of requiredTables) {
        try {
          switch (table) {
            case 'pdf_pages':
              await this.prisma.pDFPage.findFirst()
              break
            case 'document_text_search':
              await this.prisma.documentTextSearch.findFirst()
              break
            case 'pdf_processing_jobs':
              await this.prisma.pDFProcessingJob.findFirst()
              break
            case 'document_access_logs':
              await this.prisma.documentAccessLog.findFirst()
              break
          }
        } catch (error) {
          // If query fails, table likely doesn't exist
          missingTables.push(table)
        }
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
      // If we can't check, assume all tables are missing
      return {
        tablesExist: false,
        missingTables: requiredTables
      }
    }
    
    return {
      tablesExist: missingTables.length === 0,
      missingTables
    }
  }

  async checkSchemaChanges(): Promise<boolean> {
    try {
      // Check if the Document model has the new PDF fields
      const document = await this.prisma.document.findFirst({
        select: {
          id: true,
          processingStatus: true,
          totalPages: true,
          textExtracted: true
        }
      })
      
      // If we can select these fields, the schema has been updated
      return true
    } catch (error) {
      // If selecting these fields fails, schema needs updating
      return false
    }
  }

  async runFullMigration(): Promise<void> {
    console.log('Starting PDF processing system database migration...')
    
    try {
      // Check current status
      const status = await this.checkMigrationStatus()
      console.log('Migration status:', status)
      
      if (status.tablesExist) {
        console.log('All PDF processing tables already exist. Checking schema...')
        
        const schemaUpToDate = await this.checkSchemaChanges()
        if (schemaUpToDate) {
          console.log('Schema is up to date. Skipping migration.')
          return
        }
      }
      
      // Run the migration
      await this.runPDFExtensionsMigration()
      
      console.log('PDF processing system database migration completed successfully!')
      
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      console.log('Resetting database...')
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
      console.log('Database reset completed!')
    } catch (error) {
      console.error('Database reset failed:', error)
      throw error
    }
  }

  async seedDatabase(): Promise<void> {
    try {
      console.log('Seeding database...')
      execSync('npm run db:seed', { stdio: 'inherit' })
      console.log('Database seeding completed!')
    } catch (error) {
      console.error('Database seeding failed:', error)
      throw error
    }
  }
}

export const dbMigrations = new DatabaseMigrations()