// src/middleware/errorHandler.js
import { env } from '../config/env.js';

/**
 * Global Express error handler.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    status: 'error',
    message,
  };

  // Expose stack trace only in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
