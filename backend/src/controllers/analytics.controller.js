// backend/src/controllers/analytics.controller.js
import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import Inventory from "../models/inventory.model.js";
import Appointment from "../models/appointment.model.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant context missing from request.",
      });
    }

    const [invoices, totalCustomers, inventoryItems, appointments] =
      await Promise.all([
        Invoice.find({ tenantId }).sort({ createdAt: -1 }),
        Customer.countDocuments({ tenantId }),
        Inventory.find({ tenantId }),
        Appointment.find({ tenantId }),
      ]);

    let totalRevenue = 0;
    let pendingInvoicesAmount = 0;
    let pendingInvoicesCount = 0;

    // Revenue strictly tracked via official Invoices
    invoices.forEach((inv) => {
      const grandTotal = Number(inv.grandTotal || 0);
      const paid = Number(inv.amountPaid || 0);
      const balance =
        inv.balanceDue !== undefined ? Number(inv.balanceDue) : grandTotal - paid;

      if (inv.status === "PAID") {
        totalRevenue += paid > 0 ? paid : grandTotal;
      } else if (inv.status === "PARTIAL") {
        totalRevenue += paid;
      }

      if (
        inv.status !== "PAID" &&
        inv.status !== "CANCELLED" &&
        inv.status !== "REFUNDED"
      ) {
        pendingInvoicesCount++;
        pendingInvoicesAmount += Math.max(0, balance);
      }
    });

    const lowStockItems = inventoryItems.filter((item) => {
      const currentQty = Number(item.quantity ?? item.stockQuantity ?? 0);
      const threshold = Number(
        item.minStockThreshold ?? item.lowStockLimit ?? item.reorderLevel ?? 5
      );
      return currentQty <= threshold;
    });

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.max(0, Math.round(totalRevenue * 100) / 100),
          pendingInvoicesAmount: Math.max(
            0,
            Math.round(pendingInvoicesAmount * 100) / 100
          ),
          pendingInvoicesCount,
          totalCustomers,
          lowStockCount: lowStockItems.length,
          totalAppointments: appointments.length,
        },
        lowStockItems: lowStockItems.map((item) => ({
          _id: item._id,
          name: item.name,
          sku: item.sku,
          stock: Number(item.quantity ?? item.stockQuantity ?? 0),
          threshold: Number(item.minStockThreshold ?? item.lowStockLimit ?? 5),
        })),
      },
    });
  } catch (error) {
    console.error("❌ Analytics Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics.",
    });
  }
};