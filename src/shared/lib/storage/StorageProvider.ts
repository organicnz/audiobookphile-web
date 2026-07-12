import { SupabaseClient } from '@supabase/supabase-js'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface StorageProvider {
  getSignedUrl(path: string, expiresIn: number): Promise<string>
}

export class SupabaseStorageProvider implements StorageProvider {
  constructor(
    private supabase: SupabaseClient,
    private bucket: string
  ) {}

  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    const { data, error } = await this.supabase.storage.from(this.bucket).createSignedUrl(path, expiresIn)

    if (error || !data?.signedUrl) {
      throw new Error(`Supabase URL signing failed: ${error?.message}`)
    }
    return data.signedUrl
  }
}

export class B2S3StorageProvider implements StorageProvider {
  private s3Client: S3Client
  private bucket: string

  constructor() {
    this.bucket = process.env.B2_BUCKET_NAME!
    this.s3Client = new S3Client({
      endpoint: process.env.B2_ENDPOINT,
      region: process.env.B2_REGION || 'us-west-004',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!
      },
      // B2 requires path style for restricted application keys
      forcePathStyle: true
    })
  }

  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path
    })
    return getSignedUrl(this.s3Client, command, { expiresIn })
  }
}

export class StorageRouter implements StorageProvider {
  private b2Provider: B2S3StorageProvider | null = null
  private supabaseProvider: SupabaseStorageProvider

  constructor(supabase: SupabaseClient) {
    this.supabaseProvider = new SupabaseStorageProvider(supabase, 'audio-files')
    if (process.env.B2_ENDPOINT && process.env.B2_BUCKET_NAME && process.env.B2_APP_KEY) {
      this.b2Provider = new B2S3StorageProvider()
    }
  }

  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    if (path.startsWith('supabase://')) {
      const actualPath = path.substring('supabase://'.length)
      return this.supabaseProvider.getSignedUrl(actualPath, expiresIn)
    } else if (path.startsWith('b2-secondary://')) {
      const actualPath = path.substring('b2-secondary://'.length)
      if (!process.env.B2_SECONDARY_ENDPOINT) throw new Error('Secondary B2 Storage is not configured')

      const s3Client = new S3Client({
        endpoint: process.env.B2_SECONDARY_ENDPOINT,
        region: process.env.B2_SECONDARY_REGION || 'us-west-004',
        credentials: {
          accessKeyId: process.env.B2_SECONDARY_KEY_ID!,
          secretAccessKey: process.env.B2_SECONDARY_APP_KEY!
        },
        forcePathStyle: true
      })
      const command = new GetObjectCommand({
        Bucket: process.env.B2_SECONDARY_BUCKET_NAME!,
        Key: actualPath
      })
      return getSignedUrl(s3Client, command, { expiresIn })
    } else if (path.startsWith('b2://')) {
      const actualPath = path.substring('b2://'.length)
      if (!this.b2Provider) throw new Error('B2 Storage is not configured but path requires it')
      return this.b2Provider.getSignedUrl(actualPath, expiresIn)
    } else {
      // Legacy paths without prefix default to B2 if configured, else Supabase
      if (this.b2Provider) {
        return this.b2Provider.getSignedUrl(path, expiresIn)
      }
      return this.supabaseProvider.getSignedUrl(path, expiresIn)
    }
  }
}

export function getStorageProvider(supabase: SupabaseClient): StorageProvider {
  return new StorageRouter(supabase)
}
