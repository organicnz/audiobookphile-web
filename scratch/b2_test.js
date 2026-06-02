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
  forcePathStyle: false,
});

async function run() {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: 'test.mp3', // doesn't matter if it doesn't exist, we just want to see if the URL gives 404 or AccessDenied
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  console.log("URL:", url);
  
  const res = await fetch(url);
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
