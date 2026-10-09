import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    // Price fields (supports both price and unitPrice aliases)
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    // Stock fields (supports both quantity and stockQuantity aliases)
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    // Threshold fields
    reorderLevel: {
      type: Number,
      default: 10,
    },
    minStockThreshold: {
      type: Number,
      default: 10,
    },
    lowStockLimit: {
      type: Number,
      default: 10,
    },
    supplier: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"],
      default: "IN_STOCK",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to synchronize alias fields and set item status automatically
inventorySchema.pre("save", function (next) {
  // 1. Sync Stock Quantities
  if (this.stockQuantity > 0 && (!this.quantity || this.quantity === 0)) {
    this.quantity = this.stockQuantity;
  } else {
    this.stockQuantity = this.quantity;
  }

  // 2. Sync Prices
  if (this.unitPrice > 0 && (!this.price || this.price === 0)) {
    this.price = this.unitPrice;
  } else {
    this.unitPrice = this.price;
  }

  // 3. Sync Thresholds
  const threshold = this.reorderLevel || this.minStockThreshold || this.lowStockLimit || 10;
  this.reorderLevel = threshold;
  this.minStockThreshold = threshold;
  this.lowStockLimit = threshold;

  // 4. Update Stock Status Automatically
  const currentStock = Number(this.quantity || 0);
  if (currentStock <= 0) {
    this.status = "OUT_OF_STOCK";
  } else if (currentStock <= threshold) {
    this.status = "LOW_STOCK";
  } else {
    this.status = "IN_STOCK";
  }

  next();
});

// Prevent duplicate SKUs within the SAME tenant company
inventorySchema.index({ tenantId: 1, sku: 1 }, { unique: true });

export default mongoose.model("Inventory", inventorySchema);