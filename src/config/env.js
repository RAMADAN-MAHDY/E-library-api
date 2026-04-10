// src/config/env.js
// Centralised environment variable loader.
// Throws early if any required variable is missing so the server never
// silently starts with a broken configuration.

const required = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_ENDPOINT',
  'ADMIN_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'PAYMOB_API_KEY',
  'PAYMOB_IFRAME_ID',
  'PAYMOB_CARD_INTEGRATION_ID',
  'PAYMOB_WALLET_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌  Missing required environment variable: ${key}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  R2_ACCOUNT_ID: (process.env.R2_ACCOUNT_ID || '').trim(),
  R2_ACCESS_KEY_ID: (process.env.R2_ACCESS_KEY_ID || '').trim(),
  R2_SECRET_ACCESS_KEY: (process.env.R2_SECRET_ACCESS_KEY || '').trim(),
  R2_BUCKET_NAME: (process.env.R2_BUCKET_NAME || '').trim(),
  R2_ENDPOINT: (process.env.R2_ENDPOINT || '').trim(),
  R2_PUBLIC_URL: (process.env.R2_PUBLIC_URL || '').trim(),
  ADMIN_SECRET: (process.env.ADMIN_SECRET || '').trim(),
  GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  GOOGLE_CLIENT_SECRET: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),

  PAYMOB_API_KEY: (process.env.PAYMOB_API_KEY || '').trim(),
  PAYMOB_IFRAME_ID: (process.env.PAYMOB_IFRAME_ID || '').trim().replace(/^"|"$/g, ''),
  PAYMOB_CARD_INTEGRATION_ID: (process.env.PAYMOB_CARD_INTEGRATION_ID || '').trim().replace(/^"|"$/g, ''),
  PAYMOB_WALLET_INTEGRATION_ID: (process.env.PAYMOB_WALLET_INTEGRATION_ID || '').trim().replace(/^"|"$/g, ''),
  PAYMOB_HMAC_SECRET: (process.env.PAYMOB_HMAC_SECRET || '').trim(),

  DOWNLOAD_LINK_EXPIRY_SECONDS: Number(process.env.DOWNLOAD_LINK_EXPIRY_SECONDS) || 300,
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:3000').trim(),
};
