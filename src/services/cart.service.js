import Cart from '../models/Cart.js';
import File from '../models/File.js';
import { getCoverImageUrl } from './file.service.js';

/**
 * Helper: Resolve real cover URLs for all items in a populated cart.
 */
const resolveCartData = async (cartDoc) => {
  if (!cartDoc) return null;
  
  const cartObj = cartDoc.toJSON ? cartDoc.toJSON() : cartDoc;
  // Calculate total price dynamically considering discounts
  let calculatedTotal = 0;
  
  if (cartObj.items && cartObj.items.length > 0) {
    cartObj.items = await Promise.all(
      cartObj.items.map(async (item) => {
        const book = item.file;
        if (book) {
          // Resolve cover URL
          if (book.coverImageKey) {
            const result = await getCoverImageUrl(book._id || book.id);
            book.coverUrl = result.url;
          }
          
          // Use discount price if on sale
          const currentPrice = (book.isOnSale && book.discountPrice) ? book.discountPrice : (book.price || 0);
          calculatedTotal += (currentPrice * item.quantity);

          // Convert book prices to main unit for output
          book.price = book.price / 100;
          if (book.discountPrice !== null) {
            book.discountPrice = book.discountPrice / 100;
          }

          // Convert priceAtAdd as well
          item.priceAtAdd = item.priceAtAdd / 100;
        }
        return item;
      })
    );
  }
  
  cartObj.total = calculatedTotal / 100; // Divide total by 100 for main unit
  return cartObj;
};

/**
 * Get (or create) the user's cart, populated with file info.
 */
export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.file', 'title originalName description coverImageKey price isOnSale discountPrice');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return await resolveCartData(cart);
};

/**
 * Add a file to the cart (increments quantity if already present).
 */
export const addItem = async (userId, fileId) => {
  const file = await File.findById(fileId);
  if (!file) {
    const err = new Error('File not found.');
    err.statusCode = 404;
    throw err;
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existing = cart.items.find((i) => i.file.toString() === fileId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({ file: fileId, quantity: 1, priceAtAdd: file.price });
  }

  await cart.save();
  const populated = await cart.populate('items.file', 'title originalName description coverImageKey price isOnSale discountPrice');
  return await resolveCartData(populated);
};

/**
 * Remove one file from the cart entirely.
 */
export const removeItem = async (userId, fileId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const err = new Error('Cart not found.');
    err.statusCode = 404;
    throw err;
  }

  cart.items = cart.items.filter((i) => i.file.toString() !== fileId);
  await cart.save();
  const populated = await cart.populate('items.file', 'title originalName description coverImageKey price isOnSale discountPrice');
  return await resolveCartData(populated);
};

/**
 * Clear all items from the cart.
 */
export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { items: [] };
  cart.items = [];
  await cart.save();
  return cart;
};
