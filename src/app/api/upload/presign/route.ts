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
  let body: { filename: string; contentType: string; size?: number }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'API_ERROR', 400)
  }

  const { filename, contentType, size } = body

  if (!filename) {
    return apiError('Missing filename', 'API_ERROR', 400)
  }

  const THRESHOLD_BYTES = 25 * 1024 * 1024; // 25 MB
  const isSmallFile = size !== undefined && size < THRESHOLD_BYTES;
  const useB2 = !isSmallFile && process.env.B2_ENDPOINT && process.env.B2_BUCKET_NAME;

  try {
    if (useB2) {
      // 3a. Generate B2 Pre-signed URL
      const s3Client = new S3Client({
        endpoint: process.env.B2_ENDPOINT,
        region: process.env.B2_REGION || 'us-west-004',
        credentials: {
          accessKeyId: process.env.B2_KEY_ID!,
          secretAccessKey: process.env.B2_APP_KEY!,
        },
      })

      const command = new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME!,
        Key: filename,
        ContentType: contentType || 'application/octet-stream',
      })

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      return NextResponse.json({ url, provider_prefix: 'b2://' })
    } else {
      // 3b. Generate Supabase Pre-signed URL
      const { data, error } = await supabase.storage.from('audio').createSignedUploadUrl(filename)
      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to create Supabase signed URL')
      }
      
      // The signedUrl returned by Supabase might just be a token or relative path depending on the API.
      // Usually it's a full URL. Supabase Storage client handles uploads to it directly.
      // Wait, if it returns signedUrl, it includes the token.
      return NextResponse.json({ url: data.signedUrl, provider_prefix: 'supabase://' })
    }
  } catch (error: any) {
    console.error('[presign] Failed to generate presigned URL:', error)
    return apiError('Failed to generate upload URL', 'API_ERROR', 500)
  }
}
