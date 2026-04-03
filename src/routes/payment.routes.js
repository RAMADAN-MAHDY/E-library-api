// src/routes/payment.routes.js
import express, { Router } from 'express';
import verifyToken, { isAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createPaymentIntentSchema } from '../validations/payment.validation.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// Stripe Webhook (No auth needed, verified via signature)
// IMPORTANT: This route must receive the raw request body if you're using signature verification
router.post('/webhook', paymentController.handleStripeWebhook);

// All other payment routes require authentication
router.use(verifyToken);

// GET /api/v1/payments (Admin Only)
router.get('/', isAdmin, paymentController.getAll);

// POST /api/v1/payments/create-intent
router.post('/create-intent', validate(createPaymentIntentSchema), paymentController.createIntent);

export default router;
