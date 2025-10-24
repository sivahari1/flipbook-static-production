import sharp from 'sharp'

export interface WatermarkOptions {
  text: string
  opacity?: number
  fontSize?: number
  color?: string
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export async function addWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const {
    text,
    opacity = 0.3,
    fontSize = 24,
    color = 'white',
    position = 'center'
  } = options

  const image = sharp(imageBuffer)
  const { width, height } = await image.metadata()
  
  if (!width || !height) {
    throw new Error('Could not get image dimensions')
  }

  // Create watermark text as SVG
  const textSvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.5"/>
        </filter>
      </defs>
      <text 
        x="${getTextX(position, width)}" 
        y="${getTextY(position, height)}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        fill="${color}" 
        opacity="${opacity}"
        text-anchor="${getTextAnchor(position)}"
        filter="url(#shadow)"
      >${text}</text>
    </svg>
  `

  return image
    .composite([{
      input: Buffer.from(textSvg),
      blend: 'over'
    }])
    .jpeg({ quality: 85 })
    .toBuffer()
}

function getTextX(position: string, width: number): string {
  switch (position) {
    case 'top-left':
    case 'bottom-left':
      return '20'
    case 'top-right':
    case 'bottom-right':
      return (width - 20).toString()
    default:
      return (width / 2).toString()
  }
}

function getTextY(position: string, height: number): string {
  switch (position) {
    case 'top-left':
    case 'top-right':
      return '40'
    case 'bottom-left':
    case 'bottom-right':
      return (height - 20).toString()
    default:
      return (height / 2).toString()
  }
}

function getTextAnchor(position: string): string {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
      return 'end'
    case 'center':
      return 'middle'
    default:
      return 'start'
  }
}

// Create a tiled forensic watermark pattern
export async function createForensicPattern(
  width: number,
  height: number,
  identifier: string
): Promise<Buffer> {
  const tileSize = 100
  const pattern = `
    <svg width="${width}" height="${height}">
      <defs>
        <pattern id="forensic" x="0" y="0" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">
          <text x="10" y="20" font-family="monospace" font-size="8" fill="rgba(255,255,255,0.05)" transform="rotate(-45 50 50)">
            ${identifier}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#forensic)" />
    </svg>
  `

  return sharp(Buffer.from(pattern))
    .png()
    .toBuffer()
}