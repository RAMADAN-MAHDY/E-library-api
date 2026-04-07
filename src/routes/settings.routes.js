import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import validate from '../middleware/validate.js';
import { updateSettingsSchema } from '../validations/settings.validation.js';
import verifyToken, { isAdmin } from '../middleware/auth.js';

const router = Router();

// Public route to get settings
router.get('/', settingsController.getSettings);

// Protected Admin route to update settings
router.put('/', verifyToken, isAdmin, validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
