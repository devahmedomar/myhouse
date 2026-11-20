import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['expense', 'income'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

categorySchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
