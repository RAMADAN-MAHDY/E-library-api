// src/routes/payment.routes.js
import { Router } from 'express';
import verifyToken from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createPaymentIntentSchema } from '../validations/payment.validation.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// All payment routes require authentication
router.use(verifyToken);

// POST /api/v1/payments/create-intent
router.post('/create-intent', validate(createPaymentIntentSchema), paymentController.createIntent);

export default router;
