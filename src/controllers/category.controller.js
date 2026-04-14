// src/controllers/category.controller.js
import * as categoryService from '../services/category.service.js';

export const create = async (req, res, next) => {
  try {
    const coverFile = req.file || null;
    const category = await categoryService.createCategory(req.body, coverFile);
    res.status(201).json({ status: 'success', data: category });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.language) query.language = req.query.language;
    const categories = await categoryService.getCategories(query);
    res.status(200).json({ status: 'success', data: categories });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const coverFile = req.file || null;
    const category = await categoryService.updateCategory(req.params.id, req.body, coverFile);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.status(200).json({ status: 'success', data: category });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};
