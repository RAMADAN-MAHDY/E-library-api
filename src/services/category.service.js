// src/services/category.service.js
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import r2Client from '../config/r2.js';
import { env } from '../config/env.js';
import Category from '../models/Category.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pushToR2 = async (buffer, key, mimeType) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
};

const buildPresignedUrl = (key, expiresIn) => {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
};

const removeFromR2 = async (key) => {
  if (!key) return;
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
};

/**
 * Optimization: Pass full category object to avoid extra DB query (N+1 fix)
 */
export const getCategoryCoverUrl = async (categoryOrId) => {
  let category;
  if (typeof categoryOrId === 'object' && categoryOrId !== null) {
    category = categoryOrId;
  } else {
    category = await Category.findById(categoryOrId);
  }

  if (!category || !category.coverImageKey) {
    return { url: null };
  }

  if (env.R2_PUBLIC_URL) {
    const publicBase = env.R2_PUBLIC_URL.endsWith('/') ? env.R2_PUBLIC_URL : `${env.R2_PUBLIC_URL}/`;
    return { url: `${publicBase}${category.coverImageKey}` };
  }

  const SECONDS_IN_WEEK = 7 * 24 * 60 * 60;
  const url = await buildPresignedUrl(category.coverImageKey, SECONDS_IN_WEEK);
  return { url, expiresIn: SECONDS_IN_WEEK };
};

// ─── Service Methods ─────────────────────────────────────────────────────────

export const createCategory = async (data, coverObj = null) => {
  let coverImageKey = null;
  if (coverObj) {
    const imgExt = coverObj.originalname.split('.').pop();
    coverImageKey = `categories/${randomUUID()}.${imgExt}`;
    await pushToR2(coverObj.buffer, coverImageKey, coverObj.mimetype);
  }

  const category = await Category.create({ ...data, coverImageKey });
  
  // Format response
  let coverUrl = null;
  if (coverImageKey) {
    const result = await getCategoryCoverUrl(category);
    coverUrl = result.url;
  }
  
  return { ...category.toObject(), coverUrl };
};

export const getCategories = async (query = {}) => {
  const categories = await Category.find(query).sort({ name: 1 }).lean();
  
  return await Promise.all(categories.map(async (c) => {
    let coverUrl = null;
    if (c.coverImageKey) {
      const result = await getCategoryCoverUrl(c);
      coverUrl = result.url;
    }
    return { ...c, coverUrl };
  }));
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id).lean();
  if (!category) return null;
  
  let coverUrl = null;
  if (category.coverImageKey) {
    const result = await getCategoryCoverUrl(category);
    coverUrl = result.url;
  }
  return { ...category, coverUrl };
};

export const updateCategory = async (id, updates, coverObj = null) => {
  const category = await Category.findById(id);
  if (!category) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }

  if (coverObj) {
    const imgExt = coverObj.originalname.split('.').pop();
    const newCoverKey = `categories/${randomUUID()}.${imgExt}`;
    await pushToR2(coverObj.buffer, newCoverKey, coverObj.mimetype);
    
    if (category.coverImageKey) {
      await removeFromR2(category.coverImageKey); // Clean up old image
    }
    category.coverImageKey = newCoverKey;
  }

  if (updates.name !== undefined) category.name = updates.name;
  if (updates.description !== undefined) category.description = updates.description;

  await category.save();

  let coverUrl = null;
  if (category.coverImageKey) {
    const result = await getCategoryCoverUrl(category._id);
    coverUrl = result.url;
  }

  return { ...category.toObject(), coverUrl };
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }

  if (category.coverImageKey) {
    await removeFromR2(category.coverImageKey);
  }

  await category.deleteOne();
  return { message: 'Category deleted successfully' };
};
