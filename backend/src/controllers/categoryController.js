import { z } from 'zod';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';

const type = z.enum(['expense', 'income']);

export const listCategoriesQuerySchema = z.object({
  type: type.optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  icon: z.string().trim().min(1).max(20),
  type,
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(50).optional(),
    icon: z.string().trim().min(1).max(20).optional(),
  })
  .refine((data) => data.name !== undefined || data.icon !== undefined, {
    message: 'Provide at least one field to update',
  });

export async function listCategories(req, res) {
  const filter = req.query.type ? { type: req.query.type } : {};
  const categories = await Category.find(filter).sort({ createdAt: 1, name: 1 });
  return res.json(categories);
}

export async function createCategory(req, res) {
  const category = await Category.create(req.body);
  return res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  return res.json(category);
}

export async function deleteCategory(req, res) {
  const inUse = await Transaction.exists({ category: req.params.id });
  if (inUse) {
    return res
      .status(400)
      .json({ message: 'لا يمكن حذف الفئة لأنها مستخدمة في معاملات' });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  return res.json({ message: 'Category deleted' });
}
