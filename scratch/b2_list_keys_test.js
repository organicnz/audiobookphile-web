require('dotenv').config({ path: '.env.local' });
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function test() {
  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
    }
  });

  const command = new ListObjectsV2Command({
    Bucket: process.env.B2_BUCKET_NAME,
    MaxKeys: 1000
  });
  const result = await s3Client.send(command);
  console.log("Keys:");
  if (result.Contents) {
    for (const obj of result.Contents) {
      console.log(obj.Key);
    }
  } else {
    console.log("No contents");
  }
}

test();
