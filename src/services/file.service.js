// src/services/file.service.js
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import r2Client from '../config/r2.js';
import { env } from '../config/env.js';
import File from '../models/File.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pushToR2 = async (buffer, key, mimeType) => {
  console.log(`📡 [R2 DEBUG] Uploading to: ${key} (${mimeType})`);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
};

const buildPresignedUrl = (key, filename, expiresIn) => {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ...(filename && { ResponseContentDisposition: `attachment; filename="${filename}"` }),
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

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Upload the main file + optional cover image to R2, save metadata to MongoDB.
 *
 * @param {{ buffer, originalname, mimetype, size }} fileObj    - multer file (main content)
 * @param {{ buffer, originalname, mimetype } | null} coverObj  - multer file (cover image, optional)
 * @param {{ description?: string, price?: number }} meta       - extra metadata
 * @param {string} ownerId
 */
export const uploadFile = async (fileObj, coverObj, meta, ownerId) => {
  console.log(`📡 [R2 DEBUG] Using bucket: [${env.R2_BUCKET_NAME}]`);
  
  // ── Main file ──
  const ext = fileObj.originalname.split('.').pop();
  const r2Key = `uploads/${ownerId}/${randomUUID()}.${ext}`;
  await pushToR2(fileObj.buffer, r2Key, fileObj.mimetype);

  // ── Cover image (optional) ──
  let coverImageKey = null;
  if (coverObj) {
    const imgExt = coverObj.originalname.split('.').pop();
    coverImageKey = `covers/${ownerId}/${randomUUID()}.${imgExt}`;
    await pushToR2(coverObj.buffer, coverImageKey, coverObj.mimetype);
  }

  const file = await File.create({
    owner: ownerId,
    title: meta.title,
    originalName: fileObj.originalname,
    description: meta.description || '',
    price: meta.price ?? 0,
    r2Key,
    coverImageKey,
    mimeType: fileObj.mimetype,
    size: fileObj.size,
  });

  return file;
};

/**
 * Update file metadata and/or actual files.
 * If a new main file or cover is provided, we upload new and delete old from R2.
 */
export const updateFile = async (fileId, requesterId, updates, fileObj = null, coverObj = null) => {
  const file = await File.findById(fileId);

  if (!file) {
    const err = new Error('File not found.');
    err.statusCode = 404;
    throw err;
  }

  // Ownership Check
  if (file.owner.toString() !== requesterId) {
    const err = new Error('Forbidden: you do not own this file.');
    err.statusCode = 403;
    throw err;
  }

  // 1. New Main File
  if (fileObj) {
    const ext = fileObj.originalname.split('.').pop();
    const newR2Key = `uploads/${requesterId}/${randomUUID()}.${ext}`;
    await pushToR2(fileObj.buffer, newR2Key, fileObj.mimetype);
    await removeFromR2(file.r2Key); // Clean up old
    file.r2Key = newR2Key;
    file.originalName = fileObj.originalname;
  }

  // 2. New Cover
  if (coverObj) {
    const ext = coverObj.originalname.split('.').pop();
    const newCoverKey = `covers/${requesterId}/${randomUUID()}.${ext}`;
    await pushToR2(coverObj.buffer, newCoverKey, coverObj.mimetype);
    if (file.coverImageKey) {
      await removeFromR2(file.coverImageKey); // Clean up old
    }
    file.coverImageKey = newCoverKey;
  }

  // 3. Metadata
  if (updates.title !== undefined) file.title = updates.title;
  if (updates.description !== undefined) file.description = updates.description;
  if (updates.price !== undefined) file.price = Number(updates.price);

  await file.save();
  return file;
};

/**
 * Generate a temporary pre-signed download URL for a file.
 */
export const getDownloadLink = async (fileId, requesterId) => {
  const file = await File.findById(fileId);
  if (!file) {
    const err = new Error('File not found.');
    err.statusCode = 404;
    throw err;
  }

  if (file.owner.toString() !== requesterId) {
    const err = new Error('Forbidden: you do not own this file.');
    err.statusCode = 403;
    throw err;
  }

  const url = await buildPresignedUrl(file.r2Key, file.originalName, env.DOWNLOAD_LINK_EXPIRY_SECONDS);
  return { url, expiresIn: env.DOWNLOAD_LINK_EXPIRY_SECONDS };
};

/**
 * Generate a temporary pre-signed URL for a cover image.
 */
export const getCoverImageUrl = async (fileId) => {
  const file = await File.findById(fileId);
  if (!file) {
    const err = new Error('File not found.');
    err.statusCode = 404;
    throw err;
  }
  if (!file.coverImageKey) {
    const err = new Error('This file has no cover image.');
    err.statusCode = 404;
    throw err;
  }

  const url = await buildPresignedUrl(file.coverImageKey, null, env.DOWNLOAD_LINK_EXPIRY_SECONDS);
  return { url, expiresIn: env.DOWNLOAD_LINK_EXPIRY_SECONDS };
};

/**
 * Delete a file record from MongoDB and its objects from R2.
 *
 * @param {string} fileId
 * @param {string} requesterId
 */
export const deleteFile = async (fileId, requesterId) => {
  const file = await File.findById(fileId);

  if (!file) {
    const err = new Error('File not found.');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check
  if (file.owner.toString() !== requesterId) {
    const err = new Error('Forbidden: you do not own this file.');
    err.statusCode = 403;
    throw err;
  }

  // 1. Delete from R2
  await removeFromR2(file.r2Key);
  await removeFromR2(file.coverImageKey);

  // 2. Delete from MongoDB
  await file.deleteOne();

  return { message: 'File deleted successfully' };
};

/**
 * List all files (with optional filters).
 * Also generates presigned cover URLs for all files.
 */
export const getFiles = async (query = {}) => {
  const files = await File.find(query).sort({ createdAt: -1 });

  // Resolve cover URLs for all found files
  return await Promise.all(
    files.map(async (f) => {
      let coverUrl = null;
      if (f.coverImageKey) {
        const result = await getCoverImageUrl(f._id);
        coverUrl = result.url;
      }
      
      return {
        id: f._id,
        title: f.title,
        description: f.description,
        price: f.price,
        coverUrl,
        createdAt: f.createdAt,
      };
    })
  );
};
