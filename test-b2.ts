import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

async function test() {
  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION || 'us-west-004',
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_APP_KEY!,
    },
    forcePathStyle: true,
  })

  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: 'e8fe3c3e-cf0c-4908-8d47-7e4b9ff1ab09/33 - The Three-Body Problem - Chapter 33.mp3',
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  console.log('URL:', url)

  const res = await fetch(url)
  console.log('Status:', res.status)
}

test().catch(console.error)
