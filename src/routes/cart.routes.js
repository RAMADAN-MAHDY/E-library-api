// src/routes/cart.routes.js
import { Router } from 'express';
import verifyToken from '../middleware/auth.js';
import * as cartController from '../controllers/cart.controller.js';

const router = Router();

// All cart routes require authentication
router.use(verifyToken);

// GET  /api/v1/cart                  — get current user's cart
router.get('/', cartController.getCart);

// POST /api/v1/cart/:fileId          — add item (or increment quantity)
router.post('/:fileId', cartController.addItem);

// DELETE /api/v1/cart/:fileId        — remove item entirely
router.delete('/:fileId', cartController.removeItem);

// DELETE /api/v1/cart                — clear all items
router.delete('/', cartController.clearCart);

export default router;
