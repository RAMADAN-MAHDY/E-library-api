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
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
