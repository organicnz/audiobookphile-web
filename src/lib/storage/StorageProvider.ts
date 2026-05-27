import { SupabaseClient } from '@supabase/supabase-js'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface StorageProvider {
  getSignedUrl(path: string, expiresIn: number): Promise<string>
}

export class SupabaseStorageProvider implements StorageProvider {
  constructor(private supabase: SupabaseClient, private bucket: string) {}

  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn)

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
        secretAccessKey: process.env.B2_APP_KEY!,
      },
      // B2 sometimes requires path style for better compatibility depending on the endpoint setup
      forcePathStyle: false,
    })
  }

  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    })
    return getSignedUrl(this.s3Client, command, { expiresIn })
  }
}

export function getStorageProvider(supabase: SupabaseClient): StorageProvider {
  if (process.env.B2_ENDPOINT && process.env.B2_BUCKET_NAME && process.env.B2_APP_KEY) {
    return new B2S3StorageProvider()
  }
  return new SupabaseStorageProvider(supabase, 'audio-files')
}
