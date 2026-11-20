import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['expense', 'income'],
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => typeof value === 'number' && value > 0,
        message: 'Amount must be greater than 0',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    date: { type: Date, required: true, default: Date.now, index: true },
    note: {
      type: String,
      maxlength: 200,
      trim: true,
      default: '',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Supports the "newest first" listing without an in-memory sort.
transactionSchema.index({ date: -1, createdAt: -1 });

transactionSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Transaction ||
  mongoose.model('Transaction', transactionSchema);
