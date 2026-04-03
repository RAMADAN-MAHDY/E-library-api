// src/controllers/payment.controller.js
import * as paymentService from '../services/payment.service.js';

export const createIntent = async (req, res, next) => {
  try {
    const { bookId, quantity, currency } = req.body;
    const result = await paymentService.createPaymentIntent(bookId, quantity, currency, req.user.id);
    res.status(201).json({ status: 'success', data: result });
} catch (err) {
    next(err);
  }
};

/**
 * Handle Stripe Webhooks
 */
export const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.rawBody; // Captured as a Buffer in app.js

    const result = await paymentService.processWebhook(payload, signature);
    
    // Stripe expects a 200 response to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('⚠️  Webhook Error:', err.message);
    // Be careful with error status; Stripe relies on 200 to stop retrying.
    // If it's a signature mismatch, we can return 400.
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const payments = await paymentService.getPayments(query);
    res.status(200).json({ status: 'success', data: payments });
  } catch (err) {
    next(err);
  }
};
