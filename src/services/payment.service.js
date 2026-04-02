// src/services/payment.service.js
import stripe from '../config/stripe.js';
import Payment from '../models/Payment.js';

/**
 * Create a Stripe PaymentIntent and persist the record.
 *
 * @param {number} amount   - Amount in smallest currency unit (e.g. cents)
 * @param {string} currency - ISO 4217 currency code (default 'usd')
 * @param {string} userId   - MongoDB User ID
 */
export const createPaymentIntent = async (amount, currency = 'usd', userId) => {
  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { userId: userId.toString() },
    automatic_payment_methods: { enabled: true },
  });

  await Payment.create({
    user: userId,
    stripePaymentIntentId: intent.id,
    amount,
    currency,
    status: intent.status,
  });

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    currency,
  };
};
