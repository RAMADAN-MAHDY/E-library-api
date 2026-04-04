import User from '../models/User.js';
import File from '../models/File.js';
import { getCoverImageUrl } from './file.service.js';

/**
 * Helper: Resolve URLs for a list of file objects
 */
const resolveFileUrls = async (files) => {
  return await Promise.all(
    files.map(async (file) => {
      let coverUrl = null;
      if (file.coverImageKey) {
        const result = await getCoverImageUrl(file._id);
        coverUrl = result.url;
      }
      
      // Return a clean object with the resolved URL
      return {
        id: file._id,
        title: file.title,
        description: file.description,
        price: file.price,
        discountPrice: file.discountPrice,
        isOnSale: file.isOnSale,
        coverUrl,
        category: file.category,
        productType: file.productType,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdAt,
      };
    })
  );
};

/**
 * Add a book to user's favorites
 */
export const addToFavorites = async (userId, fileId) => {
  const file = await File.findById(fileId);
  if (!file) {
    const err = new Error('Book not found.');
    err.statusCode = 404;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: fileId } },
    { new: true }
  ).populate(['favorites']);

  return await resolveFileUrls(user.favorites);
};

/**
 * Remove a book from user's favorites
 */
export const removeFromFavorites = async (userId, fileId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: fileId } },
    { new: true }
  ).populate(['favorites']);

  return await resolveFileUrls(user.favorites);
};

/**
 * Get all favorite books for a user
 */
export const getFavorites = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'favorites',
    populate: ['category', 'productType']
  });
  
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return await resolveFileUrls(user.favorites);
};
