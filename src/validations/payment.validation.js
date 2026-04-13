// src/validations/payment.validation.js
import Joi from 'joi';

export const createPaymentIntentSchema = Joi.object({
  bookId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
  currency: Joi.string().length(3).lowercase().default('usd'),
  provider: Joi.string().valid('stripe', 'paymob').default('stripe').lowercase(),
  // paymentMethod: 'card' or 'wallet' — used by Paymob to choose the right integration
  paymentMethod: Joi.string().valid('card', 'wallet').default('card'),
  // phone: only required when provider=paymob AND paymentMethod=wallet
  phone: Joi.string().optional().allow('', null),
});
