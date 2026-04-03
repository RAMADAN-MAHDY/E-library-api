// src/routes/category.routes.js
import { Router } from 'express';
import verifyToken, { isAdmin } from '../middleware/auth.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

// Public: list all categories
router.get('/', categoryController.getAll);

// Protected: Admin only
router.use(verifyToken, isAdmin);

// POST /api/v1/categories
router.post('/', categoryController.create);

// PATCH /api/v1/categories/:id
router.patch('/:id', categoryController.update);

// DELETE /api/v1/categories/:id
router.delete('/:id', categoryController.remove);

export default router;
