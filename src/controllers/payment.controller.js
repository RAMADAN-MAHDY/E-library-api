// src/controllers/payment.controller.js
import * as paymentService from '../services/payment.service.js';
import { env } from '../config/env.js';

export const createIntent = async (req, res, next) => {
  try {
    const { bookId, quantity, currency, provider, phone } = req.body;
    const result = await paymentService.createPayment(bookId, provider, quantity, currency, req.user.id, phone);
    
    // المسار الجديد لصفحة حالة الدفع
    const redirectionUrl = `${env.FRONTEND_URL}/payment-status`;
    
    res.status(201).json({ 
      status: 'success', 
      data: { 
        ...result,
        redirectionUrl 
      } 
    });
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

import { verifyPaymobHMAC } from '../services/paymob.service.js';

export const handlePaymobCallback = async (req, res, next) => {
  try {
    const query = req.query; // Paymob sends data in query params for GET callbacks

    // 1. Verify HMAC for security
    const isValid = verifyPaymobHMAC(query);
    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'HMAC verification failed' });
    }

    // 2. Check if transaction was successful
    const isSuccess = query.success === 'true';
    const status = isSuccess ? 'succeeded' : 'failed';
    const messageFromPaymob = query['data.message'] || ''; // e.g. "Invalid Card Number"

    // 3. Update database using order ID (sent by Paymob as 'order')
    await paymentService.updatePaymentStatus(query.order, status);

    // 4. Redirect to frontend with clear result
    const frontendUrl = env.FRONTEND_URL;
    const finalUrl = `${frontendUrl}/payment-status?success=${isSuccess}&orderId=${query.order}&message=${encodeURIComponent(messageFromPaymob)}`;

    res.redirect(finalUrl);

  } catch (err) {
    next(err);
  }
};

/**
 * Paymob Processed Webhook (POST)
 */
export const handlePaymobWebhook = async (req, res, next) => {
  try {
    const { obj } = req.body;

    // 1. HMAC check
    if (!verifyPaymobHMAC(obj)) {
      return res.status(400).json({ status: 'error', message: 'HMAC verification failed' });
    }

    // 2. Status check
    const status = (obj.success === true) ? 'succeeded' : 'failed';

    // 3. Update the payment in DB
    // Paymob sends order details in obj.order
    await paymentService.updatePaymentStatus(obj.order.id, status);

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('⚠️ Paymob Webhook Error:', err.message);
    res.status(200).json({ received: true }); // Always return 200 to stop Paymob retries
  }
};

export const findOneByTransaction = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentByTransactionId(req.params.id, req.user.id);
    if (!payment) {
      return res.status(404).json({ status: 'error', message: 'Payment record not found.' });
    }
    res.status(200).json({ status: 'success', data: payment });
  } catch (err) {
    next(err);
  }
};

export const getMyPurchases = async (req, res, next) => {
  try {
    const query = { user: req.user.id, status: 'succeeded' };
    const payments = await paymentService.getPayments(query);
    res.status(200).json({ status: 'success', data: payments });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await paymentService.getStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.provider) query.provider = req.query.provider;
    
    const payments = await paymentService.getPayments(query);
    res.status(200).json({ status: 'success', data: payments });
  } catch (err) {
    next(err);
  }
};
