import mongoose from "mongoose";

const poItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    poNumber: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    itemsDescription: {
      type: String,
      default: "",
    },
    items: [poItemSchema],
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    expectedDate: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Received", "Cancelled"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 });

const PurchaseOrder =
  mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
