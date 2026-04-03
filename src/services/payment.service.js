// src/services/payment.service.js
import stripe from '../config/stripe.js';
import { env } from '../config/env.js';
import Payment from '../models/Payment.js';
import File from '../models/File.js';

/**
 * Create a Stripe PaymentIntent and persist the record.
 * Price is looked up from the backend database to prevent tampering.
 *
 * @param {string} bookId   - MongoDB ID for the book (File model)
 * @param {number} quantity - Number of items to buy
 * @param {string} currency - ISO 4217 currency code (default 'usd')
 * @param {string} userId   - MongoDB User ID
 */
export const createPaymentIntent = async (bookId, quantity = 1, currency = 'usd', userId) => {
  // Fetch book and price from backend to prevent tampering
  const book = await File.findById(bookId);
  if (!book) {
    const error = new Error('Book not found.');
    error.status = 404;
    throw error;
  }

  if (book.price <= 0 && !book.isOnSale) {
    const error = new Error('This book is free!');
    error.status = 400;
    throw error;
  }

  // Determine effective price (sale price vs original price)
  const unitPrice = (book.isOnSale && book.discountPrice !== null) 
    ? book.discountPrice 
    : book.price;

  // Calculate total amount in cents/pennies
  // Users manually changed totalAmount to NOT multiply by 100 earlier (meaning price is already in cents in DB)
  // I'll stick to their latest manual change: Math.round(unitPrice * quantity)
  const totalAmount = Math.round(unitPrice * quantity);

  const intent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency,
    metadata: { 
      userId: userId.toString(), 
      bookId: bookId.toString(),
      quantity: quantity.toString()
    },
    automatic_payment_methods: { enabled: true },
  });

  // console.log("----------------------------------------");
  // console.log(intent);
  await Payment.create({
    user: userId,
    book: bookId,
    stripePaymentIntentId: intent.id,
    amount: intent.amount, // Total price in cents
    currency,
    status: intent.status,
  });

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount: intent.amount,
    unitPrice,
    quantity,
    totalPrice: unitPrice * quantity, 
    bookTitle: book.title, 
    isOnSale: book.isOnSale,
    currency,
  };
};

/**
 * Verify and process the webhook payload from Stripe.
 *
 * @param {Buffer} payload   - The raw request body from Stripe
 * @param {string} signature - The 'stripe-signature' header
 */
export const processWebhook = async (payload, signature) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle the specific event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      console.log(`✅  Payment succeeded: ${intent.id}`);
      
      // Update the payment record in the database
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'succeeded' },
        { new: true }
      );

      if (!payment) {
        console.warn(`⚠️  Payment record for intent ${intent.id} not found.`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      console.error(`❌  Payment failed: ${intent.id} - ${intent.last_payment_error?.message}`);
      
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'failed' }
      );
      break;
    }

    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
  }

  return event;
};

/**
 * Get all payment records (Admin only).
 *
 * @param {object} query - Filter query
 */
export const getPayments = async (query = {}) => {
  return await Payment.find(query)
    .populate('user', 'name email')
    .populate('book', 'title price')
    .sort({ createdAt: -1 });
};
