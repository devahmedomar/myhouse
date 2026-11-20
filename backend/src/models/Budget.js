import mongoose from 'mongoose';

const isPositive = (value) => typeof value === 'number' && value > 0;

const budgetSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    validate: { validator: (v) => Number.isInteger(v), message: 'Invalid month' },
  },
  year: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => Number.isInteger(v) && v > 0,
      message: 'Invalid year',
    },
  },
  // null means the overall monthly budget (not tied to a category).
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: isPositive,
      message: 'Amount must be greater than 0',
    },
  },
});

// One budget per (year, month, category). With null-category rows this is
// already one total budget per month/year because null is a real index value.
budgetSchema.index(
  { year: 1, month: 1, category: 1 },
  { unique: true, name: 'uniq_budget_year_month_category' }
);

// Explicit partial index makes the "one total budget per month/year" rule clear.
budgetSchema.index(
  { year: 1, month: 1 },
  {
    unique: true,
    name: 'uniq_total_budget_year_month',
    partialFilterExpression: { category: { $type: 'null' } },
  }
);

budgetSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
