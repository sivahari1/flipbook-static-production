import { NextRequest, NextResponse } from 'next/server'
import { dbMigrations } from '@/lib/database/migrations'

export async function POST(request: NextRequest) {
  try {
    // Check if this is a development environment or has proper authorization
    const authHeader = request.headers.get('authorization')
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment && authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting PDF database migration...')
    
    // Check current migration status
    const status = await dbMigrations.checkMigrationStatus()
    
    if (status.tablesExist) {
      // Check if schema is up to date
      const schemaUpToDate = await dbMigrations.checkSchemaChanges()
      if (schemaUpToDate) {
        return NextResponse.json({
          success: true,
          message: 'PDF database tables and schema are up to date',
          status: 'already_migrated'
        })
      }
    }

    // Run the full migration
    await dbMigrations.runFullMigration()
    
    // Verify migration completed successfully
    const finalStatus = await dbMigrations.checkMigrationStatus()
    
    if (finalStatus.tablesExist) {
      return NextResponse.json({
        success: true,
        message: 'PDF database migration completed successfully',
        status: 'migration_completed',
        tablesCreated: [
          'pdf_pages',
          'document_text_search', 
          'pdf_processing_jobs',
          'document_access_logs'
        ]
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Migration completed but some tables are still missing',
        missingTables: finalStatus.missingTables
      }, { status: 500 })
    }

  } catch (error) {
    console.error('PDF database migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check migration status without running migration
    const status = await dbMigrations.checkMigrationStatus()
    const schemaUpToDate = await dbMigrations.checkSchemaChanges()
    
    return NextResponse.json({
      success: true,
      tablesExist: status.tablesExist,
      schemaUpToDate,
      missingTables: status.missingTables,
      requiredTables: [
        'pdf_pages',
        'document_text_search', 
        'pdf_processing_jobs',
        'document_access_logs'
      ]
    })

  } catch (error) {
    console.error('Failed to check migration status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}