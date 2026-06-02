require('dotenv').config({ path: '.env.local' });
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION || 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  forcePathStyle: true,
});

async function run() {
  const { createClient } = require('@supabase/supabase-js');
  // Use anon key just to read public data if RLS allows, or we can just fetch the file directly if we know it.
  // We can fetch from local API!
  const res0 = await fetch('http://localhost:3000/internal-api/items/4cde7fec-da53-4d8e-98e0-7934155b2856/download');
  console.log("Local API redirect:", res0.status, res0.headers.get('location'));
}
run();
