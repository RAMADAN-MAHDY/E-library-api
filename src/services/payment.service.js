import stripe from '../config/stripe.js';
import { createPaymentLink as paymobHandler } from './paymob.service.js';
import { env } from '../config/env.js';
import Payment from '../models/Payment.js';
import File from '../models/File.js';
import User from '../models/User.js';
import { getCoverImageUrl } from './file.service.js';

/**
 * Handle Stripe Payment
 */
const initiateStripe = async (book, totalAmountMainUnit, quantity, currency, userId) => {
  const amountCents = Math.round(totalAmountMainUnit * 100);

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
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
    amount: amountCents, // Store in cents
    currency,
    status: 'requires_payment_method',
  });

  return {
    provider: 'stripe',
    clientSecret: intent.client_secret,
    transactionId: intent.id,
    amount: totalAmountMainUnit, // Return in main unit
    bookTitle: book.title,
  };
};

/**
 * Handle Paymob Payment
 */
const initiatePaymob = async (book, totalAmountMainUnit, quantity, currency, userId, phone, paymentMethod) => {
  const user = await User.findById(userId);
  const amountCents = Math.round(totalAmountMainUnit * 100);

  // Paymob creates an "Order" and a "Payment Key"
  const { link, orderId } = await paymobHandler(amountCents, currency.toUpperCase(), {
    name: user.name,
    email: user.email,
    phone: phone || user.phone || '01000000000', // Using input phone first
    paymentMethod // Passing choice to paymob service
  });

  // Save the "Pending" payment record in our DB
  await Payment.create({
    user: userId,
    book: book._id,
    transactionId: orderId.toString(),
    provider: 'paymob',
    amount: amountCents, // Store in cents
    currency,
    status: 'pending',
  });

  return {
    provider: 'paymob',
    paymentLink: link,
    transactionId: orderId,
    amount: totalAmountMainUnit, // Return in main unit
    bookTitle: book.title,
  };
};

/**
 * Common entry point for creating payments.
 */
export const createPayment = async (bookId, provider = 'stripe', quantity = 1, currency = 'usd', userId, phone, paymentMethod) => {
  const book = await File.findById(bookId);
  if (!book) throw new Error('Book not found.');

  // Treat DB price/discountPrice as cents and convert to main units for processing
  const rawPrice = (book.isOnSale && book.discountPrice !== null) ? book.discountPrice : book.price;
  const unitPrice = rawPrice / 100;
  const totalAmountMainUnit = unitPrice * quantity;

  if (provider === 'paymob') {
    return await initiatePaymob(book, totalAmountMainUnit, quantity, currency, userId, phone, paymentMethod);
  }

  return await initiateStripe(book, totalAmountMainUnit, quantity, currency, userId);
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

  // 1. Payment Success/Failure
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

  // 2. Refunds
  else if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    await Payment.findOneAndUpdate(
      { transactionId: charge.payment_intent },
      { status: 'refunded' }
    );
  }

  // 3. Disputes (Complaints through Bank)
  else if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object;
    await Payment.findOneAndUpdate(
      { transactionId: dispute.payment_intent },
      { status: 'disputed' }
    );
  }
  else if (event.type === 'charge.dispute.closed') {
    const dispute = event.data.object;
    const status = dispute.status === 'won' ? 'succeeded' : 'refunded';
    await Payment.findOneAndUpdate(
      { transactionId: dispute.payment_intent },
      { status }
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
  let payment = await Payment.findOne({
    transactionId: transactionId.toString(),
    user: userId
  }).populate('book', 'title price coverImageKey');

  if (!payment) return null;

  // ─── Fail-safe: Real-time Status Verification ───
  // If DB status is not succeeded, ask the provider directly
  if (payment.status !== 'succeeded') {
    try {
      if (payment.provider === 'stripe') {
        const intent = await stripe.paymentIntents.retrieve(payment.transactionId);
        if (intent.status === 'succeeded') {
          payment.status = 'succeeded';
          await payment.save();
        }
      }
      else if (payment.provider === 'paymob') {
        // Paymob status check (requires a special service call)
        // Here we can use the GET callback status if available or leave it to webhook/redirect
        // For Paymob, we prioritize the HMAC-verified redirect status
      }
    } catch (err) {
      console.error(`❌ [Status Sync Error] for ${payment.provider}:`, err.message);
    }
  }

  const paymentObj = payment.toObject();
  const result = await getCoverImageUrl(payment.book?._id);

  // Format based on the requested structure
  return {
    _id: paymentObj._id,
    status: payment.status, // Use updated status
    amount: paymentObj.amount / 100, // Convert to main unit
    provider: paymentObj.provider,
    book: payment.book ? {
      id: payment.book._id,
      title: payment.book.title,
      price: payment.book.price / 100,
      coverUrl: result.url
    } : null,
    createdAt: paymentObj.createdAt,
    isDownloaded: paymentObj.isDownloaded || false,
    downloadExpiry: paymentObj.downloadExpiry || null,
    serverTime: new Date()
  };
};

export const getStats = async () => {
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Transform into a readable object
  const result = {
    succeeded: { amount: 0, count: 0 },
    refunded: { amount: 0, count: 0 },
    disputed: { amount: 0, count: 0 },
    failed: { amount: 0, count: 0 }
  };

  stats.forEach(s => {
    if (result[s._id]) {
      result[s._id] = { amount: s.totalAmount / 100, count: s.count };
    }
  });

  return result;
};

export const getPayments = async (query = {}) => {
  const payments = await Payment.find(query)
    .populate('user', 'name email')
    .populate('book', 'title price coverImageKey')
    .sort({ createdAt: -1 });

  // Resolve cover URLs and format response
  return await Promise.all(
    payments.map(async (p) => {
      const paymentObj = p.toObject();
      if (paymentObj.book) {
        const result = await getCoverImageUrl(paymentObj.book._id);
        paymentObj.book.id = paymentObj.book._id;
        paymentObj.book.price = paymentObj.book.price / 100;
        paymentObj.book.coverUrl = result.url;
      }

      // Convert amount and ensure download fields are present
      paymentObj.amount = paymentObj.amount / 100;
      paymentObj.isDownloaded = p.isDownloaded || false;
      paymentObj.downloadExpiry = p.downloadExpiry || null;
      paymentObj.serverTime = new Date();

      return paymentObj;
    })
  );
};
