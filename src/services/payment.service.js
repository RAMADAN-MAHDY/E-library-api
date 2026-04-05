import stripe from '../config/stripe.js';
import { createPaymentLink as paymobHandler } from './paymob.service.js';
import { env } from '../config/env.js';
import Payment from '../models/Payment.js';
import File from '../models/File.js';
import User from '../models/User.js';

/**
 * Handle Stripe Payment
 */
const initiateStripe = async (book, totalAmount, quantity, currency, userId) => {
  const intent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency,
    metadata: {
      userId: userId.toString(),
      bookId: book._id.toString(),
      quantity: quantity.toString()
    },
    automatic_payment_methods: { enabled: true },
  });

  await Payment.create({
    user: userId,
    book: book._id,
    transactionId: intent.id,
    provider: 'stripe',
    amount: intent.amount,
    currency,
    status: 'requires_payment_method',
  });

  return {
    provider: 'stripe',
    clientSecret: intent.client_secret,
    transactionId: intent.id,
    totalPrice: totalAmount,
    bookTitle: book.title,
  };
};

/**
 * Handle Paymob Payment
 */
const initiatePaymob = async (book, totalAmount, quantity, currency, userId, phone) => {
  const user = await User.findById(userId);

  // Paymob creates an "Order" and a "Payment Key"
  const { link, orderId } = await paymobHandler(totalAmount, currency.toUpperCase(), {
    name: user.name,
    email: user.email,
    phone: phone || user.phone || '01000000000' // Using input phone first
  });

  // Save the "Pending" payment record in our DB
  await Payment.create({
    user: userId,
    book: book._id,
    transactionId: orderId.toString(),
    provider: 'paymob',
    amount: totalAmount,
    currency,
    status: 'pending',
  });

  return {
    provider: 'paymob',
    paymentLink: link,
    transactionId: orderId,
    totalPrice: totalAmount,
    bookTitle: book.title,
  };
};

/**
 * Common entry point for creating payments.
 */
export const createPayment = async (bookId, provider = 'stripe', quantity = 1, currency = 'usd', userId, phone) => {
  const book = await File.findById(bookId);
  if (!book) throw new Error('Book not found.');

  const unitPrice = (book.isOnSale && book.discountPrice !== null) ? book.discountPrice : book.price;
  const totalAmount = Math.round(unitPrice * quantity);

  if (provider === 'paymob') {
    return await initiatePaymob(book, totalAmount, quantity, currency, userId, phone);
  }

  return await initiateStripe(book, totalAmount, quantity, currency, userId);
};

/**
 * Webhook Logic
 */
export const processWebhook = async (payload, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    await Payment.findOneAndUpdate(
      { transactionId: event.data.object.id },
      { status: 'succeeded' }
    );
  } else if (event.type === 'payment_intent.payment_failed') {
    await Payment.findOneAndUpdate(
      { transactionId: event.data.object.id },
      { status: 'failed' }
    );
  }

  return event;
};

/**
 * Update payment status (Generic for Paymob and others)
 */
export const updatePaymentStatus = async (transactionId, status) => {
  const payment = await Payment.findOneAndUpdate(
    { transactionId: transactionId.toString() },
    { status },
    { new: true }
  );

  if (!payment) {
    console.warn(`⚠️  Payment record for transaction ${transactionId} not found.`);
  }

  return payment;
};

export const getPaymentByTransactionId = async (transactionId, userId) => {
  const payment = await Payment.findOne({
    transactionId: transactionId.toString(),
    user: userId
  }).populate('book', 'title price');

  return payment;
};

export const getPayments = async (query = {}) => {
  return await Payment.find(query)
    .populate('user', 'name email')
    .populate('book', 'title price')
    .sort({ createdAt: -1 });
};
