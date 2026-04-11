// src/middleware/timeout.js
import { env } from '../config/env.js';

/**
 * Middleware to enforce request timeouts at the Express level.
 * @param {number} ms - Timeout in milliseconds
 */
export const requestTimeout = (ms) => (req, res, next) => {
  // Set the timeout for the underlying Node.js request/response
  req.setTimeout(ms, () => {
    const err = new Error('Request Timeout: The server took too long to respond.');
    err.statusCode = 408;
    err.code = 'TIMEOUT';
    next(err);
  });

  // Also set for the response
  res.setTimeout(ms, () => {
    const err = new Error('Response Timeout: Processing took longer than allowed.');
    err.statusCode = 408;
    err.code = 'TIMEOUT';
    next(err);
  });

  next();
};

/**
 * Helper to determine timeout based on the route
 */
export const dynamicTimeout = (req, res, next) => {
  let timeout = 30000; // Default 30s

  if (req.originalUrl.includes('/auth')) {
    timeout = env.TIMEOUT_AUTH;
  } else if (req.originalUrl.includes('/files/upload') || req.originalUrl.includes('/files/update')) {
    timeout = env.TIMEOUT_FILES;
  } else if (req.originalUrl.includes('/categories') && req.method === 'POST') {
    timeout = env.TIMEOUT_FILES; // Image uploads
  }

  return requestTimeout(timeout)(req, res, next);
};
