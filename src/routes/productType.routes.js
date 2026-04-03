// src/routes/productType.routes.js
import { Router } from 'express';
import verifyToken, { isAdmin } from '../middleware/auth.js';
import * as productTypeController from '../controllers/productType.controller.js';

const router = Router();

// Public list
router.get('/', productTypeController.getAll);

// Protected Admin Only
router.use(verifyToken, isAdmin);

router.post('/',   productTypeController.create);
router.patch('/:id', productTypeController.update);
router.delete('/:id', productTypeController.remove);

export default router;
