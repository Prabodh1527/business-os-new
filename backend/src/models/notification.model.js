import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Inventory", "Appointment", "Billing", "Employee", "AI", "Revenue", "General"],
      default: "General",
    },
    read: {
      type: Boolean,
      default: false,
    },
    readBy: {
      type: [String],
      default: [],
    },
    link: {
      type: String,
      default: "",
    },
    recipientEmployeeId: {
      type: String,
      default: "",
    },
    recipientEmail: {
      type: String,
      default: "",
      lowercase: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ tenantId: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
