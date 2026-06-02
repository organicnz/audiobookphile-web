const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function test() {
  try {
    const s3Client = new S3Client({
      endpoint: undefined,
      region: 'us-west-004',
      credentials: {
        accessKeyId: undefined,
        secretAccessKey: undefined,
      },
    });
    const command = new GetObjectCommand({
      Bucket: 'my-bucket',
      Key: 'my-key',
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("URL:", url);
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
test();
