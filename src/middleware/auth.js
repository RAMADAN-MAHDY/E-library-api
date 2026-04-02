// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Middleware: verify Bearer JWT token.
 * Attaches decoded payload to `req.user`.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

export default verifyToken;
