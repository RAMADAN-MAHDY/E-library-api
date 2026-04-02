// src/config/r2.js
import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

// Cloudflare R2 is S3-compatible.
// Endpoint format: https://<accountId>.r2.cloudflarestorage.com
const r2Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export default r2Client;
