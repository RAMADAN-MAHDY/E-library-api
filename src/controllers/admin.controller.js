// src/controllers/admin.controller.js
import * as adminService from '../services/admin.service.js';

export const getRevenueReport = async (req, res, next) => {
  try {
    const stats = await adminService.getRevenueStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardSummary();
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await adminService.getUserAnalytics();
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
};

export const getTopBooks = async (req, res, next) => {
  try {
    const stats = await adminService.getTopSellingBooks();
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
};

export const getAdvancedStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdvancedBIStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
};
