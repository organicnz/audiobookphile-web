import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anonClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse request
  let body: { filename: string; contentType: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { filename, contentType } = body

  if (!filename) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 })
  }

  // 3. Configure S3 Client for B2
  if (!process.env.B2_ENDPOINT || !process.env.B2_BUCKET_NAME) {
    return NextResponse.json({ error: 'B2 not configured' }, { status: 501 })
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
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
