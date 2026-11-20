import { z } from 'zod';
import Transaction from '../models/Transaction.js';

export const dashboardQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(9999).optional(),
});

function categoryTotalsPipeline(limit) {
  const pipeline = [
    // Charts/top lists describe spending only, so income is excluded here.
    { $match: { type: 'expense' } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'info' } },
    { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: { $ifNull: ['$info.name', 'غير معروف'] },
        icon: { $ifNull: ['$info.icon', '📦'] },
        total: 1,
      },
    },
    { $sort: { total: -1 } },
  ];
  if (limit) pipeline.push({ $limit: limit });
  return pipeline;
}

// Everything below runs inside MongoDB; the controller does no data looping.
export async function getDashboard(req, res) {
  const now = new Date();
  const month = req.query.month ?? now.getUTCMonth() + 1;
  const year = req.query.year ?? now.getUTCFullYear();

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const [result] = await Transaction.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              income: {
                $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
              },
              expenses: {
                $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
              },
            },
          },
        ],
        byCategory: categoryTotalsPipeline(),
        topCategories: categoryTotalsPipeline(5),
        byDay: [
          { $match: { type: 'expense' } },
          {
            $group: {
              _id: { $dayOfMonth: { date: '$date', timezone: 'UTC' } },
              total: { $sum: '$amount' },
            },
          },
          { $project: { _id: 0, day: '$_id', total: 1 } },
          { $sort: { day: 1 } },
        ],
        byUser: [
          { $match: { type: 'expense' } },
          { $group: { _id: '$paidBy', total: { $sum: '$amount' } } },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'info' } },
          { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              name: { $ifNull: ['$info.name', 'غير معروف'] },
              total: 1,
            },
          },
          { $sort: { total: -1 } },
        ],
        lastTransactions: [
          { $sort: { date: -1, createdAt: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $set: {
              category: {
                $cond: [
                  { $eq: [{ $type: '$category' }, 'object'] },
                  {
                    _id: '$category._id',
                    name: '$category.name',
                    icon: '$category.icon',
                    type: '$category.type',
                  },
                  null,
                ],
              },
            },
          },
          { $lookup: { from: 'users', localField: 'paidBy', foreignField: '_id', as: 'paidBy' } },
          { $unwind: { path: '$paidBy', preserveNullAndEmptyArrays: true } },
          {
            $set: {
              paidBy: {
                $cond: [
                  { $eq: [{ $type: '$paidBy' }, 'object'] },
                  { _id: '$paidBy._id', name: '$paidBy.name' },
                  null,
                ],
              },
            },
          },
          { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
          { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
          {
            $set: {
              createdBy: {
                $cond: [
                  { $eq: [{ $type: '$createdBy' }, 'object'] },
                  { _id: '$createdBy._id', name: '$createdBy.name' },
                  null,
                ],
              },
            },
          },
        ],
      },
    },
    {
      $set: {
        totals: {
          $let: {
            vars: {
              t: {
                $ifNull: [{ $arrayElemAt: ['$totals', 0] }, { income: 0, expenses: 0 }],
              },
            },
            in: {
              income: { $ifNull: ['$$t.income', 0] },
              expenses: { $ifNull: ['$$t.expenses', 0] },
              balance: {
                $subtract: [
                  { $ifNull: ['$$t.income', 0] },
                  { $ifNull: ['$$t.expenses', 0] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        totals: 1,
        byCategory: 1,
        byDay: 1,
        byUser: 1,
        topCategories: 1,
        lastTransactions: 1,
      },
    },
  ]);

  return res.json(result || {
    totals: { income: 0, expenses: 0, balance: 0 },
    byCategory: [],
    byDay: [],
    byUser: [],
    topCategories: [],
    lastTransactions: [],
  });
}
