// src/routes/category.routes.js
import { Router } from 'express';
import multer from 'multer';
import verifyToken, { isAdmin } from '../middleware/auth.js';
import * as categoryController from '../controllers/category.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for images
});

const router = Router();

// Public: list all categories
router.get('/', categoryController.getAll);

// Protected: Admin only
router.use(verifyToken, isAdmin);

// POST /api/v1/categories
router.post('/', upload.single('cover'), categoryController.create);

// PATCH /api/v1/categories/:id
router.patch('/:id', upload.single('cover'), categoryController.update);

// DELETE /api/v1/categories/:id
router.delete('/:id', categoryController.remove);

export default router;
