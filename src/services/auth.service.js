// src/services/auth.service.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, role: string }} data
 */
export const register = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    const err = new Error('Email already in use.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create(data);
  const token = signToken(user);

  return { user: sanitizeUser(user), token };
};

/**
 * Login with email & password.
 * @param {string} email
 * @param {string} password
 */
export const login = async (email, password) => {
  // Explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

export const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
