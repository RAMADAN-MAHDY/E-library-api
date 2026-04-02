// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors());
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
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
