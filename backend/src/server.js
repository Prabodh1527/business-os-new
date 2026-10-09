import "dotenv/config";

import express from "express";
import cors from "cors";
import dns from "node:dns";
import nodemailer from "nodemailer";

// Force Node.js to use Google & Cloudflare DNS for SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Database connection
import connectDB from "./config/db.js";

// Import route handlers
import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import masterRoutes from "./routes/master.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import taskRoutes from "./routes/task.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";

// Connect to Master MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CORS
// ==========================================
const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "x-tenant-id",
    "x-tenant-db",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// NODEMAILER VERIFY
// ==========================================
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Nodemailer Transporter Error:", error.message);
    } else {
      console.log("✅ SMTP Mailer is ready to send emails");
    }
  });
} else {
  console.warn("⚠️ SMTP credentials missing in .env file");
}

// ==========================================
// API ROUTES
// ==========================================
// Auth
app.use("/api/auth", authRoutes);

// Core Modules
app.use("/api/invoices", invoiceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/masters", masterRoutes);
app.use("/masters", masterRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/tenant", tenantRoutes);

// Expenses & Procurement
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);

// HR, Attendance, Leaves & Payroll
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/tasks", taskRoutes);

// Notifications, Reports & AI
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/audit-logs", auditLogRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Business OS Backend Server is running healthy!",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 404 HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error("❌ Global Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
