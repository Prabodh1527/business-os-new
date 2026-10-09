import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
  },
  sku: { type: String, default: "" },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  itemType: {
    type: String,
    enum: ["PRODUCT", "SERVICE", "SUBSCRIPTION"],
    default: "PRODUCT",
  },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  taxRate: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

const invoiceSchema = new mongoose.Schema(
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
    invoiceNumber: {
      type: String,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      taxId: { type: String, default: "" },
    },
    businessType: {
      type: String,
      enum: ["RETAIL", "SERVICE", "B2B", "SUBSCRIPTION"],
      default: "SERVICE",
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    currency: { type: String, default: "INR" },
    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "CASH", "BANK_TRANSFER", "NET_BANKING", "PENDING"],
      default: "PENDING",
    },
    upiId: { type: String, default: "merchant@upi" },

    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "PENDING", "OVERDUE", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-calculate balanceDue and status before validation
invoiceSchema.pre("validate", function (next) {
  this.balanceDue = Math.max(0, (this.grandTotal || 0) - (this.amountPaid || 0));

  if (this.status !== "CANCELLED" && this.status !== "REFUNDED") {
    if (this.balanceDue === 0 && this.grandTotal > 0) {
      this.status = "PAID";
    } else if (this.amountPaid > 0 && this.balanceDue > 0) {
      this.status = "PARTIAL";
    } else if (this.dueDate && new Date() > this.dueDate && this.balanceDue > 0) {
      this.status = "OVERDUE";
    }
  }

  next();
});

// Enforce unique invoice numbers within the same tenant
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });

const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;