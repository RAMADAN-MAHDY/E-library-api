// src/scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import ProductType from '../models/ProductType.js';

dotenv.config();

const categories = [
  'الفكر السياسي',
  'الدراسات الحضارية',
  'الفلسفة',
  'السياسية الجغرافيا',
  'الدراسات المستقبلية',
  'الأدب الثقافي'
];

const productTypes = [
  'كتب',
  'تقارير',
  'مجلات فكرية',
  'سلاسل بحثية'
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 Starting database seed...');

    // 1. Categories
    for (const name of categories) {
      await Category.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true }
      );
    }
    console.log(`✅  Seeded ${categories.length} categories.`);

    // 2. Product Types
    for (const name of productTypes) {
      await ProductType.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true }
      );
    }
    console.log(`✅  Seeded ${productTypes.length} product types.`);

    console.log('☘️  Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
