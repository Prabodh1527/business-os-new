import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
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
    expenseId: {
      type: String,
      default: () => `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Scheduled"],
      default: "Paid",
    },
    paymentMethod: {
      type: String,
      default: "UPI",
    },
    notes: {
      type: String,
      default: "",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

expenseSchema.index({ tenantId: 1, date: -1 });

const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
