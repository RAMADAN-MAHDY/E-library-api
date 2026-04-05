// src/routes/payment.routes.js
import express, { Router } from 'express';
import verifyToken, { isAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createPaymentIntentSchema } from '../validations/payment.validation.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// Stripe Webhook (No auth needed, verified via signature)
router.post('/webhook', paymentController.handleStripeWebhook);

// Paymob Callback (No auth needed, verified via HMAC)
router.get('/paymob-callback', paymentController.handlePaymobCallback);

// Paymob Webhook (POST - Processed Callback)
router.post('/paymob-webhook', paymentController.handlePaymobWebhook);

// All other payment routes require authentication
router.use(verifyToken);

// GET /api/v1/payments/my-purchases
router.get('/my-purchases', paymentController.getMyPurchases);

// GET /api/v1/payments/:id
router.get('/:id', paymentController.findOneByTransaction);

// GET /api/v1/payments/stats (Admin Only)
router.get('/stats', isAdmin, paymentController.getStats);

// GET /api/v1/payments (Admin Only)
router.get('/', isAdmin, paymentController.getAll);

// POST /api/v1/payments/create-intent
router.post('/create-intent', validate(createPaymentIntentSchema), paymentController.createIntent);

export default router;
