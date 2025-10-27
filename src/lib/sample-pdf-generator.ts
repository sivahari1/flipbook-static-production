// Simple PDF generator for demo purposes
export function generateSamplePDF(): Buffer {
  // This is a minimal but complete PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
50 700 Td
(FlipBook DRM - Document Viewer) Tj
/F1 16 Tf
50 650 Td
(This is a working PDF document!) Tj
50 620 Td
(Your uploaded document will appear here.) Tj
50 580 Td
(Database connection: WORKING) Tj
50 550 Td
(PDF Generation: WORKING) Tj
50 520 Td
(Document ID: ${Date.now()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000274 00000 n 
0000000526 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
590
%%EOF`

  return Buffer.from(pdfContent, 'utf-8')
}

// Create a sample PDF file in the public directory
export async function ensureSamplePDF() {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const publicDir = path.join(process.cwd(), 'public')
  const samplePdfPath = path.join(publicDir, 'sample.pdf')
  
  try {
    // Check if sample PDF already exists
    await fs.access(samplePdfPath)
    console.log('✅ Sample PDF already exists')
  } catch {
    try {
      // Create public directory if it doesn't exist
      await fs.mkdir(publicDir, { recursive: true })
      
      // Generate and save sample PDF
      const pdfBuffer = generateSamplePDF()
      await fs.writeFile(samplePdfPath, pdfBuffer)
      
      console.log('✅ Sample PDF created successfully')
    } catch (error) {
      console.error('❌ Failed to create sample PDF:', error)
    }
  }
}