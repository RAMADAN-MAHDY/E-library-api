// src/controllers/favorite.controller.js
import * as favoriteService from '../services/favorite.service.js';

export const add = async (req, res, next) => {
  try {
    const favorites = await favoriteService.addToFavorites(req.user.id, req.body.fileId);
    res.status(200).json({ status: 'success', data: favorites });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const favorites = await favoriteService.removeFromFavorites(req.user.id, req.params.fileId);
    res.status(200).json({ status: 'success', data: favorites });
  } catch (err) {
    next(err);
  }
};

export const get = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getFavorites(req.user.id);
    res.status(200).json({ status: 'success', data: favorites });
  } catch (err) {
    next(err);
  }
};
