// src/controllers/auth.controller.js
import * as authService from '../services/auth.service.js';
import User from '../models/User.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      const err = new Error('Invalid Admin Secret.');
      err.statusCode = 403;
      throw err;
    }

    const result = await authService.register({ name, email, password, role: 'admin' });
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const googleCallback = (req, res) => {
  const token = authService.signToken(req.user);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/auth-success?token=${token}`);

};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ status: 'success', data: authService.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};
