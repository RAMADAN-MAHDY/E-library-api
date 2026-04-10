// src/server.js
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

// console.log('MONGO_URI:', env.MONGO_URI);

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT} [${env.NODE_ENV}]`);
      // ── Paymob Config Audit (safe to log — IDs are not secrets) ──
      console.log('💳 [Paymob Config]');
      console.log(`   IFRAME_ID             : "${env.PAYMOB_IFRAME_ID}"`);
      console.log(`   CARD_INTEGRATION_ID   : "${env.PAYMOB_CARD_INTEGRATION_ID}" → Number: ${Number(env.PAYMOB_CARD_INTEGRATION_ID)}`);
      console.log(`   WALLET_INTEGRATION_ID : "${env.PAYMOB_WALLET_INTEGRATION_ID}" → Number: ${Number(env.PAYMOB_WALLET_INTEGRATION_ID)}`);
      console.log(`   FRONTEND_URL          : "${env.FRONTEND_URL}"`);
      console.log(`   BACKEND_URL           : "${env.BACKEND_URL}"`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
