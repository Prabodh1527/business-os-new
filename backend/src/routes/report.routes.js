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

// GET /api/reports/summary
router.get("/summary", async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const [invoices, inventory, customers, employees, expenses, appointments] =
      await Promise.all([
        Invoice.find({ tenantId }).sort({ createdAt: -1 }),
        Inventory.find({ tenantId }),
        Customer.find({ tenantId }),
        Employee.find({ tenantId }),
        Expense.find({ tenantId }),
        Appointment.find({ tenantId }),
      ]);

    // 1. Revenue & Billing Analytics
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let paidInvoicesCount = 0;
    const monthlyRevenueMap = {};
    const paymentMethods = { UPI: 0, CARD: 0, CASH: 0, BANK_TRANSFER: 0, OTHER: 0 };
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((m) => (monthlyRevenueMap[m] = 0));

    invoices.forEach((inv) => {
      const paid = Number(inv.amountPaid || 0);
      const grandTotal = Number(inv.grandTotal || 0);
      const balance = Number(inv.balanceDue || Math.max(0, grandTotal - paid));

      if (inv.status === "PAID") {
        totalRevenue += paid > 0 ? paid : grandTotal;
        paidInvoicesCount++;
      } else if (inv.status === "PARTIAL") {
        totalRevenue += paid;
        pendingRevenue += balance;
      } else if (inv.status !== "CANCELLED" && inv.status !== "REFUNDED") {
        pendingRevenue += balance;
      }

      // Monthly aggregation
      const invDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
      const monthName = months[invDate.getMonth()];
      if (monthName && (inv.status === "PAID" || inv.status === "PARTIAL")) {
        monthlyRevenueMap[monthName] += paid > 0 ? paid : grandTotal;
      }

      // Payment method
      const method = (inv.paymentMethod || "").toUpperCase();
      if (paymentMethods[method] !== undefined) {
        paymentMethods[method] += paid > 0 ? paid : grandTotal;
      } else {
        paymentMethods.OTHER += paid > 0 ? paid : grandTotal;
      }
    });

    const monthlyRevenue = months.map((month) => ({
      month,
      revenue: Math.round(monthlyRevenueMap[month] * 100) / 100,
    }));

    // 2. Inventory Analytics
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryStock = {};

    inventory.forEach((item) => {
      const qty = Number(item.quantity ?? item.stockQuantity ?? 0);
      const price = Number(item.price ?? item.unitPrice ?? 0);
      const threshold = Number(item.minStockThreshold ?? item.lowStockLimit ?? item.reorderLevel ?? 5);

      totalStockValue += qty * price;
      if (qty === 0) outOfStockCount++;
      else if (qty <= threshold) lowStockCount++;

      const cat = item.category || "General";
      categoryStock[cat] = (categoryStock[cat] || 0) + 1;
    });

    // 3. Employee & Payroll Analytics
    let totalPayroll = 0;
    employees.forEach((emp) => {
      totalPayroll += Number(emp.salary || 0);
    });

    // 4. Expenses Analytics
    let totalExpenses = 0;
    expenses.forEach((exp) => {
      totalExpenses += Number(exp.amount || 0);
    });

    // 5. Net Profit
    const netProfit = Math.max(0, totalRevenue - totalExpenses);
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        revenue: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          pendingRevenue: Math.round(pendingRevenue * 100) / 100,
          paidInvoicesCount,
          totalInvoices: invoices.length,
          monthlyRevenue,
          paymentMethods,
        },
        inventory: {
          totalProducts: inventory.length,
          totalStockValue: Math.round(totalStockValue * 100) / 100,
          lowStockCount,
          outOfStockCount,
          categoryBreakdown: categoryStock,
        },
        employees: {
          totalEmployees: employees.length,
          totalPayroll,
          activeCount: employees.filter((e) => (e.status || "").toUpperCase() === "ACTIVE").length,
        },
        customers: {
          totalCustomers: customers.length,
          activeCount: customers.filter((c) => (c.status || "").toUpperCase() === "ACTIVE").length,
          vipCount: customers.filter((c) => (c.status || "").toUpperCase() === "VIP").length,
        },
        expenses: {
          totalExpenses: Math.round(totalExpenses * 100) / 100,
        },
        financials: {
          netProfit: Math.round(netProfit * 100) / 100,
          profitMargin,
        },
        appointments: {
          totalAppointments: appointments.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Reports Summary Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
