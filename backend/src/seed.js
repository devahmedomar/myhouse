import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';

const SALT_ROUNDS = 10;

const defaultCategories = [
  { name: 'البقالة', icon: '🛒', type: 'expense' },
  { name: 'الفواتير', icon: '💡', type: 'expense' },
  { name: 'الإيجار', icon: '🏠', type: 'expense' },
  { name: 'المواصلات', icon: '🚗', type: 'expense' },
  { name: 'الصحة', icon: '🏥', type: 'expense' },
  { name: 'التعليم', icon: '📚', type: 'expense' },
  { name: 'الطعام خارج المنزل', icon: '🍽️', type: 'expense' },
  { name: 'الملابس', icon: '👕', type: 'expense' },
  { name: 'الترفيه', icon: '🎬', type: 'expense' },
  { name: 'الأطفال', icon: '🧒', type: 'expense' },
  { name: 'الهدايا', icon: '🎁', type: 'expense' },
  { name: 'أخرى', icon: '📦', type: 'expense' },
  { name: 'الراتب', icon: '💰', type: 'income' },
  { name: 'دخل إضافي', icon: '💵', type: 'income' },
  { name: 'أخرى', icon: '📦', type: 'income' },
];

async function seed() {
  const required = [
    'MONGODB_URI',
    'USER1_NAME',
    'USER1_EMAIL',
    'USER1_PASSWORD',
    'USER2_NAME',
    'USER2_EMAIL',
    'USER2_PASSWORD',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  const users = [
    {
      name: process.env.USER1_NAME,
      email: process.env.USER1_EMAIL.trim().toLowerCase(),
      password: process.env.USER1_PASSWORD,
    },
    {
      name: process.env.USER2_NAME,
      email: process.env.USER2_EMAIL.trim().toLowerCase(),
      password: process.env.USER2_PASSWORD,
    },
  ];
  if (users[0].email === users[1].email) {
    throw new Error('USER1_EMAIL and USER2_EMAIL must be different');
  }

  await connectDB();
  await Promise.all([
    User.init(),
    Category.init(),
    Transaction.init(),
    Budget.init(),
  ]);

  // Upsert exactly the two configured users; passwords are always hashed.
  for (const { name, email, password } of users) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await User.updateOne(
      { email },
      { $set: { name, passwordHash }, $setOnInsert: { email } },
      { upsert: true }
    );
  }

  // Upsert defaults so re-running the seed never duplicates categories.
  for (const category of defaultCategories) {
    await Category.updateOne(
      { name: category.name, type: category.type },
      { $setOnInsert: { icon: category.icon } },
      { upsert: true }
    );
  }

  console.log('Seed complete: 2 users and default categories are ready.');
}

let exitCode = 0;
try {
  await seed();
} catch (error) {
  console.error('Seed failed:', error.message);
  exitCode = 1;
} finally {
  try {
    await disconnectDB();
  } catch {
    // Connection may never have been established.
  }
}

process.exit(exitCode);
