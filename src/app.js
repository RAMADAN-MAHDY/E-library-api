// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { dynamicTimeout } from './middleware/timeout.js';

import passport from 'passport';

const app = express();

// Trust the first proxy (e.g. ngrok, Cloudflare, Heroku)
// Essential for express-rate-limit to get the real client IP
app.set('trust proxy', 1);

// ─── Timeout Middleware ──────────────────────────────────────────────────────
app.use(dynamicTimeout);

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: [
    'http://192.168.1.2:3000',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://aldawlia-publishing.vercel.app',
    env.FRONTEND_URL, // always allow whatever is set in env
  ].filter(Boolean),
  credentials: true,
}));

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Body Parsing ────────────────────────────────────────────────────────
// We need the raw body for Stripe webhook signature verification
// Set 50MB limit for file uploads
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/webhook')) {
      req.rawBody = buf;
    }
  } 
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Error Handler for Payload Too Large ─────────────────────────────────
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ 
      status: 'error',
      message: 'The maximum file size allowed is 50MB' 
    });
  }
  next(err);
});

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(globalLimiter);

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── Health Check ────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;