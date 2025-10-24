import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
  return s3Client
}

function getBucketName(): string {
  return process.env.S3_BUCKET_NAME!
}

export async function uploadToS3(key: string, data: Buffer, contentType?: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    Body: data,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  })
  
  await getS3Client().send(command)
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  })
  
  const response = await getS3Client().send(command)
  
  if (!response.Body) {
    throw new Error('No data received from S3')
  }
  
  const chunks: Buffer[] = []
  const stream = response.Body as Readable
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export async function uploadStreamToS3(key: string, stream: Readable, contentType?: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    Body: stream,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  })
  
  await getS3Client().send(command)
}