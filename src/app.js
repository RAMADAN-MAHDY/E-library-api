// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';

import passport from 'passport';

const app = express();

// Trust the first proxy (e.g. ngrok, Cloudflare, Heroku)
// Essential for express-rate-limit to get the real client IP
app.set('trust proxy', 1);

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
}));

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// We need the raw body for Stripe webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/webhook')) {
      req.rawBody = buf;
    }
  } 
}));
app.use(express.urlencoded({ extended: true }));

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(globalLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
