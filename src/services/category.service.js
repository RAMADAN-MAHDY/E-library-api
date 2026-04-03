// src/services/category.service.js
import Category from '../models/Category.js';

export const createCategory = async (data) => {
  return await Category.create(data);
};

export const getCategories = async (query = {}) => {
  return await Category.find(query).sort({ name: 1 });
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};
