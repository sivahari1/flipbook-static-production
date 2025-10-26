interface WatermarkOptions {
  userEmail: string
  timestamp: string
  format: 'webp' | 'jpeg' | 'png'
  opacity?: number
}

export async function addWatermarkToImage(
  imageBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  try {
    const { createCanvas, loadImage } = require('canvas')
    
    // Load the original image
    const image = await loadImage(imageBuffer)
    
    // Create canvas with same dimensions
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    
    // Draw original image
    ctx.drawImage(image, 0, 0)
    
    // Add watermarks
    ctx.save()
    ctx.globalAlpha = options.opacity || 0.08
    ctx.fillStyle = '#000000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    // Multiple watermark positions to prevent easy removal
    const positions = [
      { x: image.width * 0.15, y: image.height * 0.15, rotation: 45 },
      { x: image.width * 0.5, y: image.height * 0.25, rotation: -30 },
      { x: image.width * 0.85, y: image.height * 0.35, rotation: 15 },
      { x: image.width * 0.25, y: image.height * 0.65, rotation: -45 },
      { x: image.width * 0.75, y: image.height * 0.75, rotation: 30 },
      { x: image.width * 0.4, y: image.height * 0.85, rotation: -15 }
    ]
    
    positions.forEach(pos => {
      ctx.save()
      ctx.translate(pos.x, pos.y)
      ctx.rotate((pos.rotation * Math.PI) / 180)
      
      // User email watermark
      ctx.fillText(options.userEmail, 0, 0)
      
      // Company watermark
      ctx.fillText('FLIPBOOK DRM', 0, 15)
      
      // Timestamp (smaller)
      ctx.font = '10px Arial'
      const date = new Date(options.timestamp).toLocaleDateString()
      ctx.fillText(date, 0, 28)
      
      ctx.restore()
    })
    
    // Add subtle corner watermarks
    ctx.font = '8px Arial'
    ctx.globalAlpha = 0.05
    
    // Top corners
    ctx.textAlign = 'left'
    ctx.fillText(`${options.userEmail} - ${new Date(options.timestamp).toLocaleString()}`, 10, 15)
    
    ctx.textAlign = 'right'
    ctx.fillText('PROTECTED BY FLIPBOOK DRM', image.width - 10, 15)
    
    // Bottom corners
    ctx.textAlign = 'left'
    ctx.fillText('UNAUTHORIZED COPYING PROHIBITED', 10, image.height - 10)
    
    ctx.textAlign = 'right'
    ctx.fillText(`Page rendered: ${new Date().toLocaleString()}`, image.width - 10, image.height - 10)
    
    ctx.restore()
    
    // Convert back to buffer
    let buffer: Buffer
    if (options.format === 'webp') {
      // Canvas doesn't support WebP directly, use JPEG
      buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
    } else {
      buffer = canvas.toBuffer(`image/${options.format}`, { quality: 0.9 })
    }
    
    return buffer
    
  } catch (error) {
    console.error('Error adding watermark:', error)
    // Return original image if watermarking fails
    return imageBuffer
  }
}

export interface WatermarkConfig {
  userEmail: string
  timestamp: string
  positions: Array<{ x: number; y: number; rotation: number }>
  opacity: number
  rotation: number
  fontSize: string
}

export function generateWatermarkPositions(width: number, height: number): Array<{ x: number; y: number; rotation: number }> {
  return [
    { x: width * 0.15, y: height * 0.15, rotation: 45 },
    { x: width * 0.5, y: height * 0.25, rotation: -30 },
    { x: width * 0.85, y: height * 0.35, rotation: 15 },
    { x: width * 0.25, y: height * 0.65, rotation: -45 },
    { x: width * 0.75, y: height * 0.75, rotation: 30 },
    { x: width * 0.4, y: height * 0.85, rotation: -15 },
    { x: width * 0.6, y: height * 0.45, rotation: 60 },
    { x: width * 0.3, y: height * 0.55, rotation: -60 }
  ]
}

export function createDynamicWatermark(
  userEmail: string,
  documentId: string,
  pageNumber: number,
  timestamp: Date
): string {
  const components = [
    userEmail,
    'FLIPBOOK DRM',
    documentId.substring(0, 8),
    `P${pageNumber}`,
    timestamp.toISOString().substring(0, 10)
  ]
  
  return components.join(' • ')
}