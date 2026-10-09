import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET_KEY =
  process.env.JWT_SECRET || "business_os_super_secret_key_2026";

// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (user) => {
  const userId = user._id || user.id;

  const tenantId =
    user.tenantId?.toString() ||
    user.companyId?.toString() ||
    user.company?.toString() ||
    userId.toString();

  return jwt.sign(
    {
      id: userId,
      _id: userId,
      userId: userId,

      email: user.email,

      role: user.role || "OWNER",

      tenantId,
      companyId: tenantId,

      tenantDbName: user.tenantDbName || null,

      industry: user.industry || "General",
    },
    JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER OWNER
// POST /api/auth/register
// ==========================================

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "OWNER",
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique tenant database name
    const tenantDbName = `tenant_${new mongoose.Types.ObjectId().toString()}`;

    // Create tenant first
    const tenant = await Tenant.create({
      companyName: `${name}'s Workspace`,
      businessType: "Other",
      ownerId: new mongoose.Types.ObjectId(),
      dbName: tenantDbName,
      status: "ACTIVE",
      onboardingCompleted: false,
    });

    // Create owner user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role.toUpperCase(),

      tenantId: tenant._id,
      tenantDbName: tenantDbName,

      companyId: tenant._id,
    });

    // Link tenant to actual user
    tenant.ownerId = user._id;

    await tenant.save();

    // Generate JWT
    const token = generateToken(user);

    const userObj = user.toObject();

    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully.",

      token,

      user: {
        ...userObj,
        tenantId: tenant._id,
        tenantDbName,
        onboardingCompleted: false,
        token,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error during registration.",
    });
  }
};

export const registerUser = register;

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check requested role
    if (
      role &&
      user.role?.toUpperCase() !== role.toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "This account does not have access to this portal.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Password record missing for this account. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==========================================
    // LOAD TENANT
    // ==========================================

    let tenant = null;

    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
    }

    // Fallback for older users
    if (!tenant && user.companyId) {
      tenant = await Tenant.findById(user.companyId);
    }

    // ==========================================
    // TENANT STATUS CHECK
    // ==========================================

    if (tenant && tenant.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          "Your business workspace is currently suspended. Please contact support.",
      });
    }

    // ==========================================
    // ENSURE TENANT LINK EXISTS
    // ==========================================

    if (tenant) {
      user.tenantId = tenant._id;
      user.companyId = tenant._id;
      user.tenantDbName = tenant.dbName;

      await user.save({
        validateModifiedOnly: true,
      });
    }

    // Generate token
    const token = generateToken(user);

    const userObj = user.toObject();

    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",

      token,

      user: {
        ...userObj,

        tenantId: tenant?._id || user.tenantId,
        tenantDbName:
          tenant?.dbName || user.tenantDbName,

        onboardingCompleted:
          tenant?.onboardingCompleted || false,

        companyName:
          tenant?.companyName || "",

        businessType:
          tenant?.businessType || "Other",

        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error during login.",
    });
  }
};

export const loginUser = login;

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================

export const getMe = async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let tenant = null;

    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId).lean();
    }

    return res.status(200).json({
      success: true,

      user: {
        ...user.toObject(),

        tenantId: tenant?._id || user.tenantId,

        tenantDbName:
          tenant?.dbName || user.tenantDbName,

        onboardingCompleted:
          tenant?.onboardingCompleted || false,

        companyName:
          tenant?.companyName || "",

        businessType:
          tenant?.businessType || "Other",
      },

      tenant,
    });
  } catch (error) {
    console.error("GetMe Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error retrieving profile.",
    });
  }
};

export const getUserProfile = getMe;
// @desc    Permanently delete current user's account and workspace
// @route   DELETE /api/auth/account
// @access  Protected
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    // Get user with password for confirmation
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Require password confirmation
    const { currentPassword, confirmation } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    if (confirmation !== "DELETE") {
      return res.status(400).json({
        success: false,
        message: "Please type DELETE to confirm account deletion.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Find the user's tenant
    let tenant = null;

    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
    }

    // Fallback: find tenant through ownerId
    if (!tenant) {
      tenant = await Tenant.findOne({
        ownerId: user._id,
      });
    }

    /*
     * IMPORTANT:
     * Delete the isolated tenant database BEFORE deleting
     * the Tenant record so we still have access to dbName.
     */
    if (tenant?.dbName) {
      try {
        const tenantDb = mongoose.connection.useDb(
          tenant.dbName,
          {
            useCache: false,
          }
        );

        await tenantDb.dropDatabase();

        console.log(
          `Tenant database deleted: ${tenant.dbName}`
        );
      } catch (dbError) {
        console.error(
          "Tenant database deletion error:",
          dbError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to completely delete the business workspace. No account data was removed.",
        });
      }
    }

    // Delete tenant record from master database
    if (tenant) {
      await Tenant.deleteOne({
        _id: tenant._id,
      });

      console.log(
        `Tenant record deleted: ${tenant._id}`
      );
    }

    // Finally delete the user
    await User.deleteOne({
      _id: user._id,
    });

    console.log(
      `User account deleted: ${user.email}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Your account and business workspace have been permanently deleted.",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete account and workspace.",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOtp = otp;
    user.resetOtpExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save({
      validateModifiedOnly: true,
    });

    console.log(
      `[OTP] Password Reset Code for ${normalizedEmail}: ${otp}`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset OTP generated.",

      // Development only
      otp:
        process.env.NODE_ENV === "development"
          ? otp
          : undefined,
    });
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error processing forgot password request.",
    });
  }
};

// ==========================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ==========================================

export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP, and new password are required.",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: normalizedEmail,
      resetOtp: otp,
      resetOtpExpire: {
        $gt: Date.now(),
      },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save({
      validateModifiedOnly: true,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error resetting password.",
    });
  }
};

// ==========================================
// UPDATE PASSWORD
// PUT /api/auth/update-password
// ==========================================

export const updatePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const userId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    const user = await User.findById(userId).select(
      "+password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password does not match.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save({
      validateModifiedOnly: true,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully.",
    });
  } catch (error) {
    console.error(
      "Update Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while updating password.",
    });
  }
};