// src/controllers/file.controller.js
import * as fileService from '../services/file.service.js';

export const upload = async (req, res, next) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ status: 'error', message: 'No main file attached.' });
    }

    const mainFile  = req.files.file[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    const meta = {
      title: req.body.title,
      description: req.body.description || '',
      price: req.body.price ? Number(req.body.price) : 0,
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null,
      isOnSale: req.body.isOnSale === 'true' || req.body.isOnSale === true,
      category: req.body.category,
      productType: req.body.productType,
    };

    const file = await fileService.uploadFile(mainFile, coverFile, meta, req.user.id);
    res.status(201).json({ status: 'success', data: file });
  } catch (err) {
    next(err);
  }
};

export const getDownloadLink = async (req, res, next) => {
  try {
    const result = await fileService.getDownloadLink(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const getCoverImageUrl = async (req, res, next) => {
  try {
    const result = await fileService.getCoverImageUrl(req.params.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const getFileById = async (req, res, next) => {
  try {
    const result = await fileService.getFileById(req.params.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const result = await fileService.deleteFile(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    // Optional filter: owner
    const query = {};
    if (req.query.owner) query.owner = req.query.owner;
    if (req.query.category) query.category = req.query.category;
    if (req.query.productType) query.productType = req.query.productType;
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
      ];
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await fileService.getFiles(query, page, limit);
    res.status(200).json({ 
      status: 'success', 
      data: result.files,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const updateFile = async (req, res, next) => {
  try {
    const mainFile  = req.files?.file ? req.files.file[0] : null;
    const coverFile = req.files?.cover ? req.files.cover[0] : null;

    const result = await fileService.updateFile(req.params.id, req.user.id, req.body, mainFile, coverFile);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

