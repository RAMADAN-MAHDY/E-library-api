// src/controllers/cart.controller.js
import * as cartService from '../services/cart.service.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json({ status: 'success', data: cart });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user.id, req.params.fileId);
    res.status(200).json({ status: 'success', data: cart });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.fileId);
    res.status(200).json({ status: 'success', data: cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.status(200).json({ status: 'success', data: cart });
  } catch (err) {
    next(err);
  }
};
