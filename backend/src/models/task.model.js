import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    assignedTo: {
      type: String,
      default: "Unassigned",
    },
    assignedToEmail: {
      type: String,
      default: "",
    },
    createdByUserId: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    dueDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

taskSchema.index({ tenantId: 1, createdAt: -1 });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
