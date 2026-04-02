// src/routes/index.js
import { Router } from 'express';
import authRoutes    from './auth.routes.js';
import fileRoutes    from './file.routes.js';
import paymentRoutes from './payment.routes.js';
import cartRoutes    from './cart.routes.js';

const router = Router();

router.use('/auth',     authRoutes);
router.use('/files',    fileRoutes);
router.use('/payments', paymentRoutes);
router.use('/cart',     cartRoutes);

export default router;
