// src/models/ProductType.js
import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product type name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      enum: ['ar', 'en', 'es', 'fr'],
      default: 'ar',
    },
  },
  { timestamps: true }
);

const ProductType = mongoose.model('ProductType', productTypeSchema);
export default ProductType;
