import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET!

export async function uploadProductImage(
  fileBuffer: Buffer,
  mimeType: string,
  storeId: string
): Promise<string> {
  const ext = mimeType.split('/')[1] || 'jpg'
  const key = `stores/${storeId}/products/${randomUUID()}.${ext}`

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }))

  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const key = imageUrl.replace(`${process.env.CLOUDFLARE_R2_PUBLIC_URL}/`, '')
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}