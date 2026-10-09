import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    businessType: {
      type: String,
      default: "Other",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    businessEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    businessPhone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    openTime: {
      type: String,
      default: "",
      trim: true,
    },

    closeTime: {
      type: String,
      default: "",
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    dbName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    onboardingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Tenant =
  mongoose.models.Tenant ||
  mongoose.model("Tenant", tenantSchema);

export default Tenant;