// src/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
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
      enum: ['requires_payment_method', 'requires_confirmation', 'succeeded', 'canceled'],
      default: 'requires_payment_method',
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
