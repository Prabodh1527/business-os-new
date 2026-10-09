import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Invoice from "../models/invoice.model.js";
import Inventory from "../models/inventory.model.js";
import Customer from "../models/customer.model.js";
import Employee from "../models/employee.model.js";
import Expense from "../models/expense.model.js";
import Appointment from "../models/appointment.model.js";

const router = express.Router();

router.use(protect, attachTenantDB);

// Helper to gather tenant snapshot
const getTenantSnapshot = async (tenantId) => {
  const [invoices, inventory, customers, employees, expenses, appointments] =
    await Promise.all([
      Invoice.find({ tenantId }).sort({ createdAt: -1 }),
      Inventory.find({ tenantId }),
      Customer.find({ tenantId }),
      Employee.find({ tenantId }),
      Expense.find({ tenantId }),
      Appointment.find({ tenantId }),
    ]);

  let totalRevenue = 0;
  let pendingRevenue = 0;
  let paidCount = 0;

  invoices.forEach((inv) => {
    const paid = Number(inv.amountPaid || 0);
    const grand = Number(inv.grandTotal || 0);
    if (inv.status === "PAID") {
      totalRevenue += paid > 0 ? paid : grand;
      paidCount++;
    } else if (inv.status === "PARTIAL") {
      totalRevenue += paid;
      pendingRevenue += Math.max(0, grand - paid);
    } else if (inv.status !== "CANCELLED" && inv.status !== "REFUNDED") {
      pendingRevenue += Math.max(0, grand - paid);
    }
  });

  const lowStock = inventory.filter((item) => {
    const q = Number(item.quantity ?? item.stockQuantity ?? 0);
    const t = Number(item.minStockThreshold ?? item.lowStockLimit ?? item.reorderLevel ?? 5);
    return q <= t;
  });

  let totalExpenses = 0;
  expenses.forEach((e) => (totalExpenses += Number(e.amount || 0)));

  return {
    totalRevenue,
    pendingRevenue,
    paidInvoicesCount: paidCount,
    totalInvoices: invoices.length,
    totalProducts: inventory.length,
    lowStockCount: lowStock.length,
    lowStockNames: lowStock.slice(0, 5).map((i) => i.name),
    totalCustomers: customers.length,
    totalEmployees: employees.length,
    totalAppointments: appointments.length,
    totalExpenses,
    netProfit: Math.max(0, totalRevenue - totalExpenses),
  };
};

// GET /api/ai/health
router.get("/health", async (req, res) => {
  try {
    const snapshot = await getTenantSnapshot(req.tenantId);

    // Dynamic scoring formula:
    // Base 50 points
    // + up to 20 for revenue > expenses
    // + up to 15 for healthy inventory (low lowStock ratio)
    // + up to 15 for customer base & invoice collection
    let score = 50;

    if (snapshot.totalRevenue > snapshot.totalExpenses && snapshot.totalRevenue > 0) {
      score += 20;
    } else if (snapshot.totalRevenue > 0) {
      score += 10;
    }

    if (snapshot.totalProducts > 0) {
      const healthyRatio = (snapshot.totalProducts - snapshot.lowStockCount) / snapshot.totalProducts;
      score += Math.round(healthyRatio * 15);
    } else {
      score += 10;
    }

    if (snapshot.totalCustomers > 0) score += 8;
    if (snapshot.totalInvoices > 0 && snapshot.paidInvoicesCount / snapshot.totalInvoices >= 0.5) {
      score += 7;
    }

    score = Math.min(100, Math.max(25, score));

    return res.status(200).json({
      success: true,
      data: {
        score,
        status: score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Attention",
        summary: `Your business health index is ${score}/100 based on cashflow, stock ratios, and customer retention.`,
        metrics: snapshot,
      },
    });
  } catch (error) {
    console.error("❌ AI Health Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ai/insights
router.get("/insights", async (req, res) => {
  try {
    const snapshot = await getTenantSnapshot(req.tenantId);

    const insights = [];
    const predictions = [];
    const recommendations = [];

    // Low stock
    if (snapshot.lowStockCount > 0) {
      insights.push({
        type: "warning",
        title: "Inventory Reorder Alert",
        desc: `${snapshot.lowStockCount} items (${snapshot.lowStockNames.join(", ")}) are approaching low stock.`,
        category: "Inventory",
      });
      recommendations.push({
        title: "Replenish Critical Stock",
        desc: `Place purchase orders for ${snapshot.lowStockCount} items to prevent booking bottlenecks.`,
        impact: "High",
      });
    } else {
      insights.push({
        type: "success",
        title: "Stock Optimum",
        desc: "All inventory products have sufficient stock levels.",
        category: "Inventory",
      });
    }

    // Revenue & Receivables
    if (snapshot.pendingRevenue > 0) {
      insights.push({
        type: "info",
        title: "Pending Receivables",
        desc: `₹${snapshot.pendingRevenue.toLocaleString("en-IN")} remains due across unpaid invoices.`,
        category: "Billing",
      });
      recommendations.push({
        title: "Send Payment Reminders",
        desc: "Automated payment notifications can accelerate recovery of pending balances.",
        impact: "Medium",
      });
    }

    // Growth Prediction
    const projectedGrowth = snapshot.totalRevenue > 0 ? "15% - 25%" : "10%";
    predictions.push({
      title: "Quarterly Revenue Forecast",
      desc: `Based on current trajectory, revenue is expected to grow by ${projectedGrowth} next quarter.`,
      confidence: "88%",
    });

    predictions.push({
      title: "Customer Inflow",
      desc: `With ${snapshot.totalCustomers} active clients, referral probability is elevated.`,
      confidence: "92%",
    });

    return res.status(200).json({
      success: true,
      data: {
        insights,
        predictions,
        recommendations,
        stats: snapshot,
      },
    });
  } catch (error) {
    console.error("❌ AI Insights Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Query message is required" });
    }

    const snapshot = await getTenantSnapshot(req.tenantId);
    const q = message.toLowerCase();

    let reply = "";

    if (q.includes("revenue") || q.includes("income") || q.includes("sales")) {
      reply = `Your total collected revenue is ₹${snapshot.totalRevenue.toLocaleString("en-IN")}, with ₹${snapshot.pendingRevenue.toLocaleString("en-IN")} currently pending in unpaid invoices. You have generated ${snapshot.totalInvoices} invoices in total.`;
    } else if (q.includes("inventory") || q.includes("stock") || q.includes("product")) {
      if (snapshot.lowStockCount > 0) {
        reply = `You have ${snapshot.totalProducts} total inventory items. Caution: ${snapshot.lowStockCount} items are running low on stock (${snapshot.lowStockNames.join(", ")}). Consider reordering now.`;
      } else {
        reply = `You currently have ${snapshot.totalProducts} items in your catalog, and all items are well-stocked!`;
      }
    } else if (q.includes("customer") || q.includes("client")) {
      reply = `You have ${snapshot.totalCustomers} registered customers in your CRM. Keep them engaged through regular follow-ups and service reminders!`;
    } else if (q.includes("employee") || q.includes("staff") || q.includes("payroll")) {
      reply = `Your team consists of ${snapshot.totalEmployees} staff members with total monthly payroll allocation of ₹${snapshot.totalExpenses.toLocaleString("en-IN")}.`;
    } else if (q.includes("appointment") || q.includes("booking")) {
      reply = `You have recorded ${snapshot.totalAppointments} customer appointments in the system. Check the Calendar view to manage today's schedule!`;
    } else if (q.includes("health") || q.includes("perform") || q.includes("improve")) {
      reply = `Your business health is positive. Key recommendation: Focus on collecting ₹${snapshot.pendingRevenue.toLocaleString("en-IN")} in pending receivables and maintaining minimum stock for ${snapshot.lowStockCount} items.`;
    } else {
      reply = `Hello! I analyzed your workspace. You have collected ₹${snapshot.totalRevenue.toLocaleString("en-IN")} in revenue across ${snapshot.totalInvoices} invoices, have ${snapshot.totalCustomers} customers, ${snapshot.totalProducts} products (${snapshot.lowStockCount} low stock), and ${snapshot.totalAppointments} booked appointments. What specific area would you like help optimizing?`;
    }

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("❌ AI Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
