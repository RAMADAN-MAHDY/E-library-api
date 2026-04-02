// src/routes/auth.routes.js
import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, registerAdminSchema } from '../validations/auth.validation.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/v1/auth/register-admin
router.post('/register-admin', authLimiter, validate(registerAdminSchema), authController.registerAdmin);

export default router;
