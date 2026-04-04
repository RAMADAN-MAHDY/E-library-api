// src/routes/favorite.routes.js
import { Router } from 'express';
import verifyToken from '../middleware/auth.js';
import * as favoriteController from '../controllers/favorite.controller.js';

const router = Router();

// 🔐 All favorites routes require authentication
router.use(verifyToken);

router.get('/', favoriteController.get);
router.post('/add', favoriteController.add);
router.delete('/remove/:fileId', favoriteController.remove);

export default router;
