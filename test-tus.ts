import * as tus from 'tus-js-client'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const projectId = new URL(supabaseUrl).hostname.split('.')[0]

async function test() {
  const filePath = 'sample.mp3'
  // Create dummy file
  fs.writeFileSync(filePath, Buffer.alloc(7 * 1024 * 1024))
  
  const file = fs.createReadStream(filePath)
  const size = fs.statSync(filePath).size

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file as any, {
      endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0],
      headers: {
        authorization: `Bearer ${anonKey}`, // we need user token but anonKey might fail with 401
        apikey: anonKey,
        'x-upsert': 'true'
      },
      uploadDataDuringCreation: true,
      metadata: {
        bucketName: 'audio-files',
        objectName: 'test-tus-upsert.mp3',
        contentType: 'audio/mpeg'
      },
      onError: (error) => {
        console.log('TUS Error:', error)
        reject(error)
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        console.log(bytesUploaded, bytesTotal)
      },
      onSuccess: () => {
        console.log('TUS Success')
        resolve(null)
      }
    })
    upload.start()
  })
}

test().catch(console.error)
