// src/routes/index.js
import { Router } from 'express';
import authRoutes    from './auth.routes.js';
import fileRoutes    from './file.routes.js';
import paymentRoutes from './payment.routes.js';
import cartRoutes    from './cart.routes.js';
import categoryRoutes from './category.routes.js';
import productTypeRoutes from './productType.routes.js';
import adminRoutes from './admin.routes.js';
import favoriteRoutes from './favorite.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth',          authRoutes);
router.use('/files',         fileRoutes);
router.use('/payments',      paymentRoutes);
router.use('/cart',          cartRoutes);
router.use('/categories',    categoryRoutes);
router.use('/product-types', productTypeRoutes);
router.use('/admin',         adminRoutes);
router.use('/favorites',     favoriteRoutes);
router.use('/settings',      settingsRoutes);

export default router;
