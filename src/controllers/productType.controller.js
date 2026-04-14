// src/controllers/productType.controller.js
import * as productTypeService from '../services/productType.service.js';

export const create = async (req, res, next) => {
  try {
    const type = await productTypeService.createProductType(req.body);
    res.status(201).json({ status: 'success', data: type });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.language) query.language = req.query.language;
    const types = await productTypeService.getProductTypes(query);
    res.status(200).json({ status: 'success', data: types });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const type = await productTypeService.updateProductType(req.params.id, req.body);
    if (!type) {
      return res.status(404).json({ status: 'error', message: 'Product type not found' });
    }
    res.status(200).json({ status: 'success', data: type });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const type = await productTypeService.deleteProductType(req.params.id);
    if (!type) {
      return res.status(404).json({ status: 'error', message: 'Product type not found' });
    }
    res.status(200).json({ status: 'success', message: 'Product type deleted successfully' });
  } catch (err) {
    next(err);
  }
};
