import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";

const resolveTenant = async (req) => {
  // 1. Try tenantId from authenticated request
  if (req.tenantId && mongoose.Types.ObjectId.isValid(req.tenantId)) {
    const tenant = await Tenant.findById(req.tenantId);

    if (tenant) {
      return tenant;
    }
  }

  // 2. Try the logged-in user's tenantId
  const userId = req.user?._id || req.user?.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  if (
    user.tenantId &&
    mongoose.Types.ObjectId.isValid(user.tenantId)
  ) {
    const tenant = await Tenant.findById(user.tenantId);

    if (tenant) {
      req.tenantId = tenant._id.toString();
      req.companyId = tenant._id.toString();

      return tenant;
    }
  }

  // 3. Existing user but no valid tenant → create one
  const tenant = await Tenant.create({
    companyName: `${user.name || "My"} Business`,
    ownerId: user._id,
    dbName:
      user.tenantDbName ||
      `tenant_${Date.now()}`,
  });

  // Link tenant back to user
  user.tenantId = tenant._id;
  user.tenantDbName = tenant.dbName;

  await user.save({ validateModifiedOnly: true });

  req.tenantId = tenant._id.toString();
  req.companyId = tenant._id.toString();

  return tenant;
};

// ==========================================
// GET MY BUSINESS
// GET /api/tenant/me
// ==========================================

export const getMyTenant = async (req, res) => {
  try {
    const tenant = await resolveTenant(req);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Unable to create business workspace.",
      });
    }

    return res.status(200).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Get Tenant Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to load business profile.",
    });
  }
};

// ==========================================
// UPDATE MY BUSINESS
// PUT /api/tenant/me
// ==========================================

export const updateMyTenant = async (req, res) => {
  try {
    const tenant = await resolveTenant(req);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Unable to create business workspace.",
      });
    }

    const {
      companyName,
      businessType,
      description,
      businessEmail,
      businessPhone,
      address,
      city,
      state,
      country,
      postalCode,
      website,
      logo,
      theme,
      brandColor,
      compactLayout,
      showAnimations,
      openTime,
      closeTime,
      onboardingCompleted,
    } = req.body;

    if (companyName !== undefined && !companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name cannot be empty.",
      });
    }

    if (companyName?.trim()) tenant.companyName = companyName.trim();
    if (businessType !== undefined) tenant.businessType = businessType?.trim() || "Other";
    if (description !== undefined) tenant.description = description?.trim() || "";
    if (businessEmail !== undefined) tenant.businessEmail = businessEmail?.trim().toLowerCase() || "";
    if (businessPhone !== undefined) tenant.businessPhone = businessPhone?.trim() || "";
    if (address !== undefined) tenant.address = address?.trim() || "";
    if (city !== undefined) tenant.city = city?.trim() || "";
    if (state !== undefined) tenant.state = state?.trim() || "";
    if (country !== undefined) tenant.country = country?.trim() || "India";
    if (postalCode !== undefined) tenant.postalCode = postalCode?.trim() || "";
    if (website !== undefined) tenant.website = website?.trim() || "";
    if (logo !== undefined) tenant.logo = logo || "";

    if (theme !== undefined) tenant.theme = theme;
    if (brandColor !== undefined) tenant.brandColor = brandColor;
    if (compactLayout !== undefined) tenant.compactLayout = Boolean(compactLayout);
    if (showAnimations !== undefined) tenant.showAnimations = Boolean(showAnimations);

    if (req.body.aiConfig !== undefined) {
      tenant.aiConfig = {
        ...tenant.aiConfig,
        ...req.body.aiConfig,
      };
    }

    if (openTime !== undefined) tenant.openTime = openTime?.trim() || "";
    if (closeTime !== undefined) tenant.closeTime = closeTime?.trim() || "";

    if (onboardingCompleted === true) {
      tenant.onboardingCompleted = true;
      tenant.onboardingCompletedAt =
        tenant.onboardingCompletedAt || new Date();
    }

    await tenant.save();

    return res.status(200).json({
      success: true,
      message:
        onboardingCompleted === true
          ? "Business setup completed successfully."
          : "Business profile updated successfully.",
      data: tenant,
    });
  } catch (error) {
    console.error("Update Tenant Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update business profile.",
    });
  }
};