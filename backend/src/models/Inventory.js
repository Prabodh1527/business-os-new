import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    minStockThreshold: { type: Number, default: 5 }, // Triggers low-stock alert
    status: { type: String, enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK' },
  },
  { timestamps: true }
);

// Auto-update status based on stock count before saving
InventorySchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.stockQuantity <= this.minStockThreshold) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'IN_STOCK';
  }
  next();
});

export default mongoose.model('Inventory', InventorySchema);