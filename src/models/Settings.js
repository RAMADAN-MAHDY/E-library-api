import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  footerText: {
    type: String,
    default: "© 2026 E-Library. All rights reserved.",
    trim: true
  },
  phone: {
    type: String,
    default: "+1234567890",
    trim: true
  },
  facebookLink: {
    type: String,
    default: "https://facebook.com",
    trim: true
  },
  instagramLink: {
    type: String,
    default: "https://instagram.com",
    trim: true
  },
  whatsappLink: {
    type: String,
    default: "https://wa.me/1234567890",
    trim: true
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
