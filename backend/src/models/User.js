import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      default: function () {
        return this.email ? this.email.split("@")[0] : "User";
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Keeps password hidden unless explicitly asked for
    },
    role: {
      type: String,
      enum: ["OWNER", "MANAGER", "EMPLOYEE", "ADMIN", "USER"],
      default: "OWNER",
    },
    // Multi-tenant fields linking the owner in business_os to their DB
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    tenantDbName: {
      type: String,
      required: function () {
        // Required for business owners/admins who own an isolated database
        return this.role === "OWNER" || this.role === "ADMIN";
      },
    },
    phone: String,
    employeeId: String,
    jobTitle: String,
    department: String,
    joinDate: String,
    salary: String,
    status: {
      type: String,
      default: "Active",
    },
    resetOtp: String,
    resetOtpExpire: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;