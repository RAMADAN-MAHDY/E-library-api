// src/validations/file.validation.js
import Joi from 'joi';

// Validates metadata sent alongside an upload
export const uploadMetaSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).required(),
  description: Joi.string().max(1000).optional().allow(''),
  price: Joi.number().integer().min(0).default(0),
  discountPrice: Joi.number().integer().min(0).optional().allow(null),
  isOnSale: Joi.boolean().default(false),
  category: Joi.string().hex().length(24).required(),
  productType: Joi.string().hex().length(24).required(),
});

export const updateFileSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  price: Joi.number().integer().min(0).optional(),
  discountPrice: Joi.number().integer().min(0).optional().allow(null),
  isOnSale: Joi.boolean().optional(),
  category: Joi.string().hex().length(24).optional(),
  productType: Joi.string().hex().length(24).optional(),
});
