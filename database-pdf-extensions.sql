-- PDF Processing System Database Extensions
-- Run this after the main database-setup.sql to add PDF processing capabilities

-- Enable additional extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search similarity

-- Extend existing documents table with PDF-specific columns
ALTER TABLE "Document" 
ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "totalPages" INTEGER,
ADD COLUMN IF NOT EXISTS "processingStatus" TEXT DEFAULT 'pending' CHECK ("processingStatus" IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS "textExtracted" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "fileSize" BIGINT,
ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
ADD COLUMN IF NOT EXISTS "originalFilename" TEXT;

-- PDF pages table for storing processed page information
CREATE TABLE IF NOT EXISTS "PDFPage" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "documentId" TEXT NOT NULL REFERENCES "Document"(id) ON DELETE CASCADE,
    "pageNumber" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "textContent" TEXT,
    "textBounds" JSONB, -- Store text positioning data
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("documentId", "pageNumber")
);

-- Document text search table with full-text search capabilities
CREATE TABLE IF NOT EXISTS "DocumentTextSearch" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "documentId" TEXT NOT NULL REFERENCES "Document"(id) ON DELETE CASCADE,
    "pageNumber" INTEGER NOT NULL,
    "searchableText" TEXT NOT NULL,
    "wordPositions" JSONB, -- Store word positions for highlighting
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("documentId", "pageNumber")
);

-- PDF processing jobs table for background job tracking
CREATE TABLE IF NOT EXISTS "PDFProcessingJob" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "documentId" TEXT NOT NULL REFERENCES "Document"(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document access logs table for analytics and security
CREATE TABLE IF NOT EXISTS "DocumentAccessLog" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "userId" TEXT REFERENCES "User"(id),
    "documentId" TEXT NOT NULL REFERENCES "Document"(id) ON DELETE CASCADE,
    "pageNumber" INTEGER,
    action TEXT NOT NULL CHECK (action IN ('view', 'search', 'navigate', 'download', 'share')),
    "ipAddress" INET,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "timeSpent" INTEGER, -- Time spent in seconds
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "PDFPage_documentId_idx" ON "PDFPage"("documentId");
CREATE INDEX IF NOT EXISTS "PDFPage_pageNumber_idx" ON "PDFPage"("pageNumber");
CREATE INDEX IF NOT EXISTS "DocumentTextSearch_documentId_idx" ON "DocumentTextSearch"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentTextSearch_pageNumber_idx" ON "DocumentTextSearch"("pageNumber");
CREATE INDEX IF NOT EXISTS "PDFProcessingJob_documentId_idx" ON "PDFProcessingJob"("documentId");
CREATE INDEX IF NOT EXISTS "PDFProcessingJob_status_idx" ON "PDFProcessingJob"(status);
CREATE INDEX IF NOT EXISTS "DocumentAccessLog_documentId_idx" ON "DocumentAccessLog"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentAccessLog_userId_idx" ON "DocumentAccessLog"("userId");
CREATE INDEX IF NOT EXISTS "DocumentAccessLog_createdAt_idx" ON "DocumentAccessLog"("createdAt");
CREATE INDEX IF NOT EXISTS "Document_processingStatus_idx" ON "Document"("processingStatus");

-- Create full-text search index for document text search
CREATE INDEX IF NOT EXISTS "DocumentTextSearch_fts_idx" 
ON "DocumentTextSearch" 
USING gin(to_tsvector('english', "searchableText"));

-- Create trigram index for fuzzy text search
CREATE INDEX IF NOT EXISTS "DocumentTextSearch_trigram_idx" 
ON "DocumentTextSearch" 
USING gin("searchableText" gin_trgm_ops);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS "Document_owner_status_idx" ON "Document"("ownerId", "processingStatus");
CREATE INDEX IF NOT EXISTS "PDFPage_document_page_idx" ON "PDFPage"("documentId", "pageNumber");
CREATE INDEX IF NOT EXISTS "DocumentAccessLog_document_time_idx" ON "DocumentAccessLog"("documentId", "createdAt");

-- Create function to update document processing status
CREATE OR REPLACE FUNCTION update_document_processing_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update document processing status based on job completion
    IF NEW.status = 'completed' THEN
        UPDATE "Document" 
        SET "processingStatus" = 'completed', 
            "processedAt" = NOW()
        WHERE id = NEW."documentId";
    ELSIF NEW.status = 'failed' THEN
        UPDATE "Document" 
        SET "processingStatus" = 'failed'
        WHERE id = NEW."documentId";
    ELSIF NEW.status = 'processing' AND OLD.status = 'queued' THEN
        UPDATE "Document" 
        SET "processingStatus" = 'processing'
        WHERE id = NEW."documentId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update document status
DROP TRIGGER IF EXISTS update_document_status_trigger ON "PDFProcessingJob";
CREATE TRIGGER update_document_status_trigger
    AFTER UPDATE ON "PDFProcessingJob"
    FOR EACH ROW
    EXECUTE FUNCTION update_document_processing_status();

-- Create function to calculate document total pages from PDF pages
CREATE OR REPLACE FUNCTION update_document_total_pages()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total pages count when pages are added
    UPDATE "Document" 
    SET "totalPages" = (
        SELECT COUNT(*) 
        FROM "PDFPage" 
        WHERE "documentId" = NEW."documentId"
    )
    WHERE id = NEW."documentId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update total pages
DROP TRIGGER IF EXISTS update_total_pages_trigger ON "PDFPage";
CREATE TRIGGER update_total_pages_trigger
    AFTER INSERT OR DELETE ON "PDFPage"
    FOR EACH ROW
    EXECUTE FUNCTION update_document_total_pages();

-- Create function for text search with ranking
CREATE OR REPLACE FUNCTION search_document_text(
    doc_id TEXT,
    search_query TEXT,
    page_limit INTEGER DEFAULT 10,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    page_number INTEGER,
    text_content TEXT,
    rank REAL,
    headline TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dts."pageNumber",
        dts."searchableText",
        ts_rank(to_tsvector('english', dts."searchableText"), plainto_tsquery('english', search_query)) as rank,
        ts_headline('english', dts."searchableText", plainto_tsquery('english', search_query)) as headline
    FROM "DocumentTextSearch" dts
    WHERE dts."documentId" = doc_id
    AND to_tsvector('english', dts."searchableText") @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, dts."pageNumber" ASC
    LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Create function for fuzzy text search
CREATE OR REPLACE FUNCTION fuzzy_search_document_text(
    doc_id TEXT,
    search_query TEXT,
    similarity_threshold REAL DEFAULT 0.3,
    page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    page_number INTEGER,
    text_content TEXT,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dts."pageNumber",
        dts."searchableText",
        similarity(dts."searchableText", search_query) as sim
    FROM "DocumentTextSearch" dts
    WHERE dts."documentId" = doc_id
    AND similarity(dts."searchableText", search_query) > similarity_threshold
    ORDER BY sim DESC, dts."pageNumber" ASC
    LIMIT page_limit;
END;
$$ LANGUAGE plpgsql;

-- Create view for document processing statistics
CREATE OR REPLACE VIEW "DocumentProcessingStats" AS
SELECT 
    d.id as "documentId",
    d.title,
    d."processingStatus",
    d."totalPages",
    d."textExtracted",
    d."processedAt",
    j.progress,
    j."errorMessage",
    j."startedAt",
    j."completedAt",
    CASE 
        WHEN j."completedAt" IS NOT NULL AND j."startedAt" IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (j."completedAt" - j."startedAt"))
        ELSE NULL 
    END as "processingDurationSeconds"
FROM "Document" d
LEFT JOIN "PDFProcessingJob" j ON d.id = j."documentId"
WHERE j.id IS NULL OR j.id = (
    SELECT id FROM "PDFProcessingJob" 
    WHERE "documentId" = d.id 
    ORDER BY "createdAt" DESC 
    LIMIT 1
);

-- Create view for document access analytics
CREATE OR REPLACE VIEW "DocumentAccessAnalytics" AS
SELECT 
    d.id as "documentId",
    d.title,
    d."ownerId",
    COUNT(dal.id) as "totalAccesses",
    COUNT(DISTINCT dal."userId") as "uniqueViewers",
    COUNT(CASE WHEN dal.action = 'view' THEN 1 END) as "pageViews",
    COUNT(CASE WHEN dal.action = 'search' THEN 1 END) as "searchQueries",
    AVG(dal."timeSpent") as "avgTimeSpentSeconds",
    MAX(dal."createdAt") as "lastAccessedAt",
    MIN(dal."createdAt") as "firstAccessedAt"
FROM "Document" d
LEFT JOIN "DocumentAccessLog" dal ON d.id = dal."documentId"
GROUP BY d.id, d.title, d."ownerId";

-- Insert sample data for testing (optional)
-- This will be removed in production
/*
INSERT INTO "Document" (title, "ownerId", "pageCount", "storageKey", "processingStatus") 
SELECT 
    'Sample PDF Document',
    u.id,
    5,
    'sample-pdf-key',
    'pending'
FROM "User" u 
WHERE u.email = 'test@example.com'
ON CONFLICT DO NOTHING;
*/

COMMIT;