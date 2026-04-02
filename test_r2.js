// test_r2.js
import 'dotenv/config';
import { PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import r2Client from './src/config/r2.js';
import { env } from './src/config/env.js';

async function testConnection() {
  console.log('📡 [DEBUG] Testing R2 connection...');
  console.log(' - Endpoint:', env.R2_ENDPOINT);
  console.log(' - Bucket:', env.R2_BUCKET_NAME);
  
  try {
    // 1. Test if bucket exists/accessible
    console.log(' ⏳  Checking bucket accessibility...');
    await r2Client.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET_NAME }));
    console.log(' ✅  Bucket is accessible.');

    // 2. Test writing a small file
    console.log(' ⏳  Testing write permission...');
    await r2Client.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: 'test-connection.txt',
      Body: 'Connection test successful!',
      ContentType: 'text/plain',
    }));
    console.log(' ✅  Write test successful!');
    console.log('\n🌟 CONGRATULATIONS! Your R2 configuration is 100% correct.');

  } catch (err) {
    console.error('\n❌  Connection Test Failed:');
    console.error(' Error Name:', err.name);
    console.error(' Message:', err.message);
    
    if (err.name === 'NoSuchBucket' || err.message.includes('not exist')) {
      console.warn('\n⚠️   TIP: The bucket name might be wrong. Check "labrary" spelling.');
    }
    if (err.name === 'AccessDenied') {
      console.warn('\n⚠️   TIP: Check your Access Key / Secret Key permissions.');
    }
  }
}

testConnection();
