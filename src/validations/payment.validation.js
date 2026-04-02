// src/validations/payment.validation.js
import Joi from 'joi';

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().integer().min(50).required()
    .messages({ 'number.min': 'Amount must be at least 50 (cents).' }),
  currency: Joi.string().length(3).lowercase().default('usd'),
});
