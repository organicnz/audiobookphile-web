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
    Key: "25b44a7d-8cea-4479-bb3b-8e218ec8870f/Sagan, Carl -- The Demon-Haunted World - Science as a Candle in the Dark -- 01 of 4.mp3",
  });
  const url = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
  console.log("URL:", url);
  const res = await fetch(url);
  const text = await res.text();
  console.log("Response text:", text);
}
test();
