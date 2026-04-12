// src/services/productType.service.js
import ProductType from '../models/ProductType.js';

export const createProductType = async (data) => {
  return await ProductType.create(data);
};

export const getProductTypes = async (query = {}) => {
  return await ProductType.find(query).sort({ name: 1 });
};

export const updateProductType = async (id, data) => {
  return await ProductType.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

export const deleteProductType = async (id) => {
  return await ProductType.findByIdAndDelete(id);
};
