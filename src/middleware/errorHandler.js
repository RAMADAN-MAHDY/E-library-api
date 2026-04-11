// src/middleware/errorHandler.js
import { env } from '../config/env.js';

/**
 * Global Express error handler.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Timeout Errors
  if (err.code === 'TIMEOUT' || err.code === 'ECONNABORTED' || statusCode === 408) {
    statusCode = 408;
    message = 'Request Timeout: The server or an external service took too long to respond. Please try again.';
    console.error(`🕒 [TIMEOUT ERROR] ${err.message}`);
  }

  // Handle Mongoose Timeout
  if (err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    message = 'Database Timeout: Could not connect to the database in time. Please try again later.';
  }

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
