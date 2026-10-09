import mongoose from "mongoose";

const masterSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active master entries
// for the same tenant, type and name.
masterSchema.index(
  { tenantId: 1, type: 1, name: 1 },
  { unique: true }
);

const Master =
  mongoose.models.Master || mongoose.model("Master", masterSchema);

export default Master;