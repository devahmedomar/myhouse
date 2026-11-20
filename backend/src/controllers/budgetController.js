import { z } from 'zod';
import Budget from '../models/Budget.js';
import { objectId } from '../middleware/validate.js';

export const budgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(9999).optional(),
});

export const upsertBudgetSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1900).max(9999),
  category: objectId.nullable().default(null),
  amount: z.number().positive(),
});

function monthYear(query) {
  const now = new Date();
  return {
    month: query.month ?? now.getUTCMonth() + 1,
    year: query.year ?? now.getUTCFullYear(),
  };
}

export async function listBudgets(req, res) {
  const { month, year } = monthYear(req.query);
  const budgets = await Budget.find({ month, year })
    .populate({ path: 'category', select: 'name icon type' })
    .sort({ category: 1 });
  return res.json(budgets);
}

export async function upsertBudget(req, res) {
  const { month, year, category, amount } = req.body;
  const key = { year, month, category: category ?? null };

  // Ensure the unique indexes exist before relying on upsert for concurrency.
  await Budget.init();

  const budget = await Budget.findOneAndUpdate(
    key,
    { $set: { amount }, $setOnInsert: key },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate({ path: 'category', select: 'name icon type' });

  return res.json(budget);
}
