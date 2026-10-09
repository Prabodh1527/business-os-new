import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
    appointmentId: {
      type: String,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    service: {
      type: String,
      required: true,
    },
    employee: {
      type: String,
      default: "Unassigned",
    },
    date: {
      type: String, // YYYY-MM-DD or readable string
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "REFUNDED"],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness per tenant
appointmentSchema.index({ tenantId: 1, appointmentId: 1 }, { unique: true });

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export default Appointment;