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

export const googleCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error('Google authentication failed.');
      err.statusCode = 401;
      throw err;
    }

    // تحقق إذا اليوزر موجود في الـ Database
    let user = await User.findOne({ googleId: req.user.googleId });

    // لو مش موجود - انشئ حساب جديد
    if (!user) {
      user = await User.create({
        name: req.user.displayName,
        email: req.user.emails?.[0]?.value,
        googleId: req.user.googleId,
        avatar: req.user.photos?.[0]?.value,
      });
    }

    const token = authService.signToken(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    res.redirect(`${frontendUrl}?token=${token}`);
  } catch (err) {
    next(err);
  }
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