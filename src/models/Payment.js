// src/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'paymob'],
      default: 'stripe',
    },
    amount: {
      type: Number, // in smallest currency unit (e.g. cents)
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    status: {
      type: String,
      // Using generic statuses that map to both
      enum: ['pending', 'succeeded', 'failed', 'canceled', 'requires_payment_method', 'refunded', 'disputed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);

/**
 * DB MIGRATION: Drop old index that causes duplicate key error
 * This is safe to leave here until first successful start.
 */
Payment.collection.dropIndex('stripePaymentIntentId_1').catch(() => {
  // Silence error if index already dropped or missing
});

export default Payment;
