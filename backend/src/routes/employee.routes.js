import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";

import Employee from "../models/employee.model.js";
import User from "../models/User.js";
import { getEmployeeIdentity, isEmployeeUser } from "../utils/employeeIdentity.js";

const router = express.Router();

// Guard all routes
router.use(protect, attachTenantDB);

router.get("/me", async (req, res) => {
  try {
    if (!isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employee access only." });
    }

    const identity = await getEmployeeIdentity(req);
    if (!identity?.employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    return res.status(200).json({ success: true, employee: identity.employee, data: identity.employee });
  } catch (error) {
    console.error("❌ Fetch Employee Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/me", async (req, res) => {
  try {
    if (!isEmployeeUser(req)) {
      return res.status(403).json({ success: false, message: "Employee access only." });
    }

    const identity = await getEmployeeIdentity(req);
    if (!identity?.employee?._id) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    const updated = await Employee.findOneAndUpdate(
      { _id: identity.employee._id, tenantId: req.tenantId },
      {
        $set: {
          phone: String(req.body.phone || "").trim(),
          emergencyName: String(req.body.emergencyName || "").trim(),
          emergencyPhone: String(req.body.emergencyPhone || "").trim(),
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, employee: updated, data: updated });
  } catch (error) {
    console.error("❌ Update Employee Profile Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 1. GET ALL EMPLOYEES & STATS
// GET /api/employees
// ==========================================
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find({
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });

    let activeCount = 0;
    let onLeaveCount = 0;
    let totalPayroll = 0;

    employees.forEach((emp) => {
      const status = (emp.status || "").toUpperCase();

      if (status === "ACTIVE") {
        activeCount++;
      }

      if (status === "ON_LEAVE" || status === "ON LEAVE") {
        onLeaveCount++;
      }

      totalPayroll += Number(emp.salary || 0);
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: employees.length,
        activeCount,
        onLeaveCount,
        totalPayroll,
      },
      employees,
      data: employees,
    });
  } catch (error) {
    console.error("❌ Fetch Employees Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// 2. GET SINGLE EMPLOYEE
// GET /api/employees/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      employee,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// 3. CREATE EMPLOYEE & PORTAL ACCOUNT
// POST /api/employees
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role = "Staff",
      department = "Operations",
      salary = 0,
      status = "ACTIVE",
    } = req.body;

    // ------------------------------------------
    // Validate input
    // ------------------------------------------
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ------------------------------------------
    // Check duplicate employee
    // ------------------------------------------
    const existingEmployee = await Employee.findOne({
      tenantId: req.tenantId,
      email: normalizedEmail,
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email is already registered.",
      });
    }

    // ------------------------------------------
    // Check existing portal account
    // ------------------------------------------
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "A login account already exists with this email. Please use a different employee email.",
      });
    }

    // ------------------------------------------
    // Generate employee ID
    // ------------------------------------------
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const employeeId = `EMP-${randomSuffix}`;

    // ------------------------------------------
    // Generate temporary password
    // ------------------------------------------
    const tempPassword = `Pass@${crypto
      .randomBytes(3)
      .toString("hex")}`;

    // ------------------------------------------
    // HASH PASSWORD
    // IMPORTANT:
    // Login uses bcrypt.compare(), so the password
    // MUST be stored as a bcrypt hash.
    // ------------------------------------------
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ------------------------------------------
    // 1. Create Employee Record
    // ------------------------------------------
    const newEmployee = await Employee.create({
      tenantId: req.tenantId,
      employeeId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      role: role?.trim() || "Staff",
      department: department?.trim() || "Operations",
      salary: Number(salary) || 0,
      joinDate: new Date().toISOString().slice(0, 10),
      status: status.toUpperCase(),
    });

    // ------------------------------------------
    // 2. Create Employee Portal User
    // ------------------------------------------
    try {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "EMPLOYEE",
        tenantId: req.tenantId,
        tenantDbName: undefined,
        employeeId,
        jobTitle: role?.trim() || "Staff",
        department: department?.trim() || "Operations",
        phone: phone?.trim() || "",
        joinDate: newEmployee.joinDate,
        salary: String(Number(salary) || 0),
      });
    } catch (userError) {
      // Roll back employee record if portal account
      // creation fails.
      await Employee.deleteOne({
        _id: newEmployee._id,
      });

      console.error(
        "❌ Employee Portal User Creation Error:",
        userError
      );

      return res.status(500).json({
        success: false,
        message:
          "Employee was not created because the portal login account could not be created.",
      });
    }

    // ------------------------------------------
    // 3. Send Login Credentials
    // ------------------------------------------
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        "⚠️ SMTP credentials are missing. Employee was created, but login email was not sent."
      );

      return res.status(201).json({
        success: true,
        message:
          "Employee registered successfully, but email credentials could not be sent because SMTP is not configured.",
        employee: newEmployee,
        data: newEmployee,
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const portalUrl =
        process.env.CLIENT_URL || "http://localhost:5173";

      await transporter.sendMail({
        from: `"Business OS" <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject: "Your Employee Portal Login Credentials",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              background: #f8fafc;
              border-radius: 12px;
            "
          >

            <div
              style="
                background: #4f46e5;
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
              "
            >
              <h2 style="margin: 0;">
                Welcome to Business OS
              </h2>
            </div>

            <p>
              Hello <strong>${name}</strong>,
            </p>

            <p>
              Your employee profile and portal account have been
              successfully created.
            </p>

            <div
              style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
              "
            >

              <p>
                <strong>Employee ID:</strong>
                ${employeeId}
              </p>

              <p>
                <strong>Login Email:</strong>
                ${normalizedEmail}
              </p>

              <p>
                <strong>Temporary Password:</strong>
                ${tempPassword}
              </p>

            </div>

            <p>
              <strong>Employee Portal:</strong>
            </p>

            <p>
              <a
                href="${portalUrl}/login"
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  background: #4f46e5;
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                "
              >
                Open Employee Portal
              </a>
            </p>

            <p style="color: #64748b; font-size: 13px;">
              Please change your password after signing in.
            </p>

          </div>
        `,
      });

      console.log(
        `✅ Employee login credentials sent to ${normalizedEmail}`
      );
    } catch (mailError) {
      console.error(
        "❌ Employee Email Error:",
        mailError.message
      );

      // Employee and login account already exist.
      // Do NOT delete them just because email failed.
      return res.status(201).json({
        success: true,
        message:
          "Employee registered successfully, but the login email could not be sent.",
        employee: newEmployee,
        data: newEmployee,
      });
    }

    // ------------------------------------------
    // SUCCESS
    // ------------------------------------------
    return res.status(201).json({
      success: true,
      message:
        "Employee registered successfully and login credentials were sent by email.",
      employee: newEmployee,
      data: newEmployee,
    });
  } catch (error) {
    console.error("❌ Add Employee Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create employee.",
    });
  }
});

// ==========================================
// 4. DELETE EMPLOYEE
// DELETE /api/employees/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Deactivate employee portal login
    if (employee.email) {
      await User.findOneAndUpdate(
        {
          email: employee.email,
          tenantId: req.tenantId,
        },
        {
          $set: {
            status: "Inactive",
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Employee removed successfully.",
    });
  } catch (error) {
    console.error("❌ Delete Employee Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// 5. UPDATE EMPLOYEE
// PATCH /api/employees/:id
// ==========================================
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.tenantId,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee: updated,
      data: updated,
    });
  } catch (error) {
    console.error("❌ Update Employee Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;