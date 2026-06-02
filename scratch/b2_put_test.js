require('dotenv').config({ path: '.env.local' });
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function test() {
  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
    }
  });

  const key = "25b44a7d-8cea-4479-bb3b-8e218ec8870f/Sagan, Carl -- The Demon-Haunted World - Science as a Candle in the Dark -- 01 of 4.mp3";

  try {
    const putCmd = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: 'Fake MP3 Content'
    });
    await s3Client.send(putCmd);
    console.log("Uploaded successfully!");

    const getCmd = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
    console.log("URL:", url);
  } catch(e) {
    console.log("Error:", e.message);
  }
}

test();
