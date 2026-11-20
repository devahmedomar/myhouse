import { z } from 'zod';
import Transaction from '../models/Transaction.js';
import { objectId } from '../middleware/validate.js';

const transactionType = z.enum(['expense', 'income']);
const month = z.coerce.number().int().min(1).max(12).optional();
const year = z.coerce.number().int().min(1900).max(9999).optional();

// Shared filters used by both the JSON list and the CSV export.
export const transactionFilterSchema = z.object({
  month,
  year,
  type: transactionType.optional(),
  category: objectId.optional(),
  paidBy: objectId.optional(),
  q: z.string().trim().max(200).optional(),
});

export const transactionListQuerySchema = transactionFilterSchema.extend({
  page: z.coerce.number().int().positive().max(100000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createTransactionSchema = z.object({
  type: transactionType,
  amount: z.number().positive(),
  category: objectId,
  date: z.coerce.date(),
  note: z.string().trim().max(200).default(''),
  paidBy: objectId,
});

export const updateTransactionSchema = z
  .object({
    type: transactionType.optional(),
    amount: z.number().positive().optional(),
    category: objectId.optional(),
    date: z.coerce.date().optional(),
    note: z.string().trim().max(200).optional(),
    paidBy: objectId.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: 'Provide at least one field to update' }
  );

const categorySelect = { name: 1, icon: 1, type: 1 };
const userSelect = { name: 1 };

function buildFilter(query) {
  const filter = {};

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.paidBy) filter.paidBy = query.paidBy;

  if (query.q) {
    // Escape regex metacharacters: q is plain search text, not a pattern.
    const escaped = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.note = { $regex: escaped, $options: 'i' };
  }

  // Apply a UTC month window only when both parts are supplied.
  if (query.month !== undefined && query.year !== undefined) {
    filter.date = {
      $gte: new Date(Date.UTC(query.year, query.month - 1, 1)),
      $lt: new Date(Date.UTC(query.year, query.month, 1)),
    };
  }

  return filter;
}

function populateReadable(query) {
  return query
    .populate({ path: 'category', select: categorySelect })
    .populate({ path: 'paidBy', select: userSelect })
    .populate({ path: 'createdBy', select: userSelect });
}

export async function listTransactions(req, res) {
  const { page, limit, ...filters } = req.query;
  const filter = buildFilter(filters);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    populateReadable(
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ),
    Transaction.countDocuments(filter),
  ]);

  return res.json({ items, total, page });
}

export async function exportTransactions(req, res) {
  const filter = buildFilter(req.query);

  const transactions = await populateReadable(
    Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean()
  );

  const csvCell = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const typeLabel = (value) => (value === 'income' ? 'إيراد' : 'مصروف');

  const rows = [
    ['التاريخ', 'النوع', 'الفئة', 'المبلغ', 'الدفع بواسطة', 'ملاحظة']
      .map(csvCell)
      .join(','),
    ...transactions.map((item) =>
      [
        new Date(item.date).toISOString().slice(0, 10),
        typeLabel(item.type),
        item.category?.name || '',
        item.amount,
        item.paidBy?.name || '',
        item.note || '',
      ]
        .map(csvCell)
        .join(',')
    ),
  ];

  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="transactions.csv"');
  return res.send(`\uFEFF${rows.join('\r\n')}`);
}

export async function createTransaction(req, res) {
  const transaction = await Transaction.create({
    ...req.body,
    createdBy: req.user.id,
  });
  return res.status(201).json(
    await populateReadable(Transaction.findById(transaction._id).lean())
  );
}

export async function getTransaction(req, res) {
  const transaction = await populateReadable(
    Transaction.findById(req.params.id).lean()
  );
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  return res.json(transaction);
}

export async function updateTransaction(req, res) {
  const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  return res.json(await populateReadable(Transaction.findById(transaction._id).lean()));
}

export async function deleteTransaction(req, res) {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  return res.json({ message: 'Transaction deleted' });
}
