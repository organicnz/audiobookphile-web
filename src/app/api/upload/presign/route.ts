import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/upload/presign
 * 
 * Generates an S3 pre-signed URL for direct browser uploads to Backblaze B2.
 */
export async function POST(request: NextRequest) {
  // 1. Verify Authentication
  const { user, supabase } = await requireApiAuth(request)
    if (!user || !supabase) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

  // 2. Parse request
  let body: { filename: string; contentType: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'API_ERROR', 400)
  }

  const { filename, contentType } = body

  if (!filename) {
    return apiError('Missing filename', 'API_ERROR', 400)
  }

  // 3. Configure S3 Client for B2
  if (!process.env.B2_ENDPOINT || !process.env.B2_BUCKET_NAME) {
    return apiError('B2 not configured', 'API_ERROR', 501)
  }

  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT, // e.g. https://s3.us-west-004.backblazeb2.com
    region: process.env.B2_REGION || 'us-west-004', // AWS SDK requires a region
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_APP_KEY!,
    },
  })

  // 4. Generate Pre-signed URL
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: filename,
      ContentType: contentType || 'application/octet-stream',
    })

    // Presigned URL expires in 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('[presign] Failed to generate presigned URL:', error)
    return apiError('Failed to generate upload URL', 'API_ERROR', 500)
  }
}
