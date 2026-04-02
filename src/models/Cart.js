// src/models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    priceAtAdd: {
      type: Number, // snapshot of file.price when added
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Virtual: total price
cartSchema.virtual('total').get(function () {
  return this.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
