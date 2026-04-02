// src/controllers/payment.controller.js
import * as paymentService from '../services/payment.service.js';

export const createIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    const result = await paymentService.createPaymentIntent(amount, currency, req.user.id);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};
