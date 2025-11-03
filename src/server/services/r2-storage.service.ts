import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/env'

class R2StorageService {
  private client: S3Client

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY
      }
    })
  }

  async uploadAudio(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const key = `audio/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: fileName
      }
    })

    try {
      const result = await this.client.send(command)
      console.log(`Audio uploaded successfully: ${key} (ETag: ${result.ETag})`)
      return key
    } catch (error) {
      console.error('R2 upload failed:', error)
      throw new Error(`Failed to upload audio to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key
    })

    try {
      return await getSignedUrl(this.client, command, { expiresIn })
    } catch (error) {
      console.error('Failed to generate signed URL:', error)
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getAudioBuffer(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key
    })

    try {
      const response = await this.client.send(command)
      const chunks: Uint8Array[] = []

      if (response.Body) {
        // @ts-expect-error - Body is a readable stream
        for await (const chunk of response.Body) {
          chunks.push(chunk)
        }
      }

      return Buffer.concat(chunks)
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') {
        throw new Error(`Audio file not found: ${key}`)
      }
      console.error('Failed to download audio:', error)
      throw new Error(`Failed to download audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const r2StorageService = new R2StorageService()
