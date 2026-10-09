import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // 1. Extract Bearer token
    if (authHeader && authHeader.toLowerCase().startsWith("bearer")) {
      token = authHeader.replace(/^Bearer\s+/i, "").trim();
    }

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no valid token provided",
      });
    }

    // 2. Verify token
    const secret = process.env.JWT_SECRET || "business_os_super_secret_key_2026";
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing user identifier",
      });
    }

    // 3. Fetch user record
    let user = null;
    try {
      user = await User.findById(userId).select("-password").lean();
    } catch (dbErr) {
      console.error("User query error in auth middleware:", dbErr.message);
    }

    if (!user) {
      user = {
        _id: userId,
        id: userId,
        email: decoded.email || "",
        role: decoded.role || "OWNER",
        companyId: decoded.companyId || userId,
      };
    }

    // 4. Resolve workspace / tenant ID
    const companyId =
      user.tenantId?.toString() ||
      user.companyId?.toString() ||
      decoded.companyId?.toString() ||
      decoded.tenantId?.toString() ||
      userId.toString();

    req.user = user;
    req.tenantId = companyId;
    req.companyId = companyId;

    return next();
  } catch (error) {
    console.error("JWT Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired",
      error: error.message,
    });
  }
};