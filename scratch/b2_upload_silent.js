require('dotenv').config({ path: '.env.local' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

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
  const fileBuffer = fs.readFileSync('silent.mp3');

  try {
    const putCmd = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: 'audio/mpeg'
    });
    await s3Client.send(putCmd);
    console.log("Uploaded silent MP3 successfully!");
  } catch(e) {
    console.log("Error:", e.message);
  }
}

test();
