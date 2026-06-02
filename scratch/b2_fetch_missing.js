require('dotenv').config({ path: '.env.local' });
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function test() {
  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
    },
    forcePathStyle: true
  });

  const getCmd = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: "does_not_exist.mp3",
  });
  const url = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
  const res = await fetch(url);
  const text = await res.text();
  console.log("Missing file response text:", text);
}
test();
