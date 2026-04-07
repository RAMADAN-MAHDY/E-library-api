import * as settingsService from '../services/settings.service.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return res.status(200).json({ status: 'success', data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    return res.status(200).json({ status: 'success', message: 'Settings updated successfully', data: settings });
  } catch (error) {
    next(error);
  }
};
