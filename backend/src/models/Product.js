import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String },
  unitPrice: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);