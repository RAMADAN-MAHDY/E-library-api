// src/validations/file.validation.js
import Joi from 'joi';

// Validates metadata sent alongside an upload
export const uploadMetaSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).required(),
  description: Joi.string().max(1000).optional().allow(''),
  price: Joi.number().integer().min(0).default(0),
});

export const updateFileSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  price: Joi.number().integer().min(0).optional(),
});
