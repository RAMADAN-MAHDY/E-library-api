// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Applied globally to every route
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});

// Stricter limit for auth endpoints to block brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many auth attempts, please try again later.' },
});
