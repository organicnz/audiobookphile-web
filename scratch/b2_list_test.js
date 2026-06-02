require('dotenv').config({ path: '.env.local' });
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function test(forcePathStyle) {
  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
    },
    forcePathStyle: forcePathStyle,
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.B2_BUCKET_NAME,
      MaxKeys: 1
    });
    const result = await s3Client.send(command);
    console.log(`Success with forcePathStyle: ${forcePathStyle}. Objects:`, result.Contents?.length || 0);
  } catch (e) {
    console.log(`Failed with forcePathStyle: ${forcePathStyle}. Error:`, e.message);
  }
}

test(false).then(() => test(true));
