// src/validations/file.validation.js
import Joi from 'joi';

// Validates metadata sent alongside an upload
export const uploadMetaSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),

  description: Joi.string().max(3000).optional().allow(''),

  price: Joi.number().min(0).required(),

  discountPrice: Joi.number()
    .min(0)
    .less(Joi.ref('price'))
    .when('isOnSale', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null)
    }),

  isOnSale: Joi.boolean().default(false),

  category: Joi.string().hex().length(24).required(),

  productType: Joi.string().hex().length(24).required(),

  release_date: Joi.date().iso().max('now').optional().allow(null),
});

export const updateFileSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().max(3000).optional().allow(''),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).optional().allow(null),
  isOnSale: Joi.boolean().optional(),
  category: Joi.string().hex().length(24).optional(),
  productType: Joi.string().hex().length(24).optional(),
  release_date: Joi.date().iso().max('now').optional().allow(null),
});
