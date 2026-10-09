import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    supplierId: {
      type: String,
      default: () => `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

supplierSchema.index({ tenantId: 1, name: 1 });

const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default Supplier;
