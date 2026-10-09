import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Invoice from "../models/invoice.model.js";
import Inventory from "../models/inventory.model.js";

const router = express.Router();

// Guard all invoice routes
router.use(protect, attachTenantDB);

// ==========================================
// EMAIL HELPERS
// ==========================================
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendPaymentReceiptEmail = async (invoice, paymentAmount) => {
  if (!invoice.customer?.email || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const isFullyPaid = invoice.status === "PAID";
    const emailSubject = isFullyPaid
      ? `Payment Received - Invoice #${invoice.invoiceNumber} Fully Paid`
      : `Partial Payment Receipt - Invoice #${invoice.invoiceNumber}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
        <div style="max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #4F46E5; margin: 0 0 5px 0;">BUSINESS OS</h2>
          <h3 style="margin: 0 0 20px 0; color: #1e293b;">Payment Confirmation Receipt</h3>
          <p>Dear <strong>${invoice.customer.name}</strong>,</p>
          <p>We received a payment of <strong>₹${paymentAmount.toLocaleString("en-IN")}</strong> for Invoice <strong>#${invoice.invoiceNumber}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border-radius: 6px; font-size: 14px;">
            <tr><td style="padding: 12px 16px;">Grand Total:</td><td style="padding: 12px 16px; text-align: right;">₹${invoice.grandTotal.toLocaleString("en-IN")}</td></tr>
            <tr><td style="padding: 12px 16px;">Payment Made Now:</td><td style="padding: 12px 16px; text-align: right; color: #10B981; font-weight: bold;">₹${paymentAmount.toLocaleString("en-IN")}</td></tr>
            <tr><td style="padding: 12px 16px;">Remaining Balance:</td><td style="padding: 12px 16px; text-align: right; color: ${isFullyPaid ? "#10B981" : "#dc2626"}; font-weight: bold;">₹${invoice.balanceDue.toLocaleString("en-IN")}</td></tr>
          </table>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Business OS" <${process.env.SMTP_USER}>`,
      to: invoice.customer.email,
      subject: emailSubject,
      html: htmlContent,
    });
  } catch (mailErr) {
    console.error("⚠️ Email receipt error:", mailErr.message);
  }
};

// ==========================================
// 1. GET ALL INVOICES & STATS
// GET /api/invoices
// ==========================================
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });

    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;

    invoices.forEach((inv) => {
      totalRevenue += Number(inv.amountPaid) || 0;
      if (inv.status === "PAID") {
        paidCount++;
      } else if (inv.status !== "CANCELLED") {
        pendingCount++;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalInvoices: invoices.length,
        totalRevenue: Math.max(0, Math.round(totalRevenue * 100) / 100),
        paidCount,
        pendingCount,
      },
      invoices,
      data: invoices,
    });
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET SINGLE INVOICE BY ID
// GET /api/invoices/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    return res.status(200).json({
      success: true,
      invoice,
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. CREATE INVOICE & AUTO-DEDUCT STOCK
// POST /api/invoices
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      customer,
      businessType,
      items,
      discountTotal = 0,
      paymentMethod,
      upiId,
      currency = "INR",
      dueDate,
      notes,
    } = req.body;

    const customerName = typeof customer === "string" ? customer : customer?.name;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer name and at least one item are required.",
      });
    }

    const customerObj = typeof customer === "string" ? { name: customer } : customer;

    let subtotal = 0;
    let taxTotal = 0;

    const processedItems = items.map((item) => {
      const itemSubtotal = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
      const itemTax = (itemSubtotal * (Number(item.taxRate) || 0)) / 100;
      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      taxTotal += itemTax;

      return {
        ...item,
        name: item.name || item.description || "Product",
        total: itemTotal,
      };
    });

    const grandTotal = Math.round((subtotal + taxTotal - Number(discountTotal)) * 100) / 100;
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const invoiceNumber = `INV-${randomSuffix}`;

    const newInvoice = await Invoice.create({
      tenantId: req.tenantId,
      userId: req.user?._id,
      invoiceNumber,
      customer: customerObj,
      businessType: businessType || "SERVICE",
      items: processedItems,
      subtotal,
      taxTotal,
      discountTotal: Number(discountTotal),
      grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,
      currency,
      paymentMethod: paymentMethod || "PENDING",
      upiId: upiId || "merchant@upi",
      dueDate: dueDate || null,
      notes: notes || "",
      status: "PENDING",
    });

    // Auto-deduct stock for items tied to inventory
    for (const item of items) {
      const targetId = item._id || item.inventoryId || item.id;
      const targetSku = item.sku;

      let searchFilter = { tenantId: req.tenantId };
      if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
        searchFilter._id = targetId;
      } else if (targetSku) {
        searchFilter.sku = targetSku;
      } else if (item.name) {
        searchFilter.name = item.name;
      }

      if (searchFilter._id || searchFilter.sku || searchFilter.name) {
        const qtyToDeduct = Number(item.quantity) || 1;
        await Inventory.findOneAndUpdate(
          searchFilter,
          { $inc: { quantity: -qtyToDeduct, stockQuantity: -qtyToDeduct } },
          { new: true }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: `Invoice #${newInvoice.invoiceNumber} generated!`,
      invoice: newInvoice,
      data: newInvoice,
    });
  } catch (error) {
    console.error("❌ Invoice Creation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. RECORD PAYMENT
// POST /api/invoices/:id/payment & /api/invoices/payment
// ==========================================
const recordPayment = async (req, res, targetId, amount) => {
  const paymentAmount = Number(amount);

  if (!paymentAmount || paymentAmount <= 0) {
    return res.status(400).json({ success: false, message: "Valid payment amount is required" });
  }

  const invoice = await Invoice.findOne({ _id: targetId, tenantId: req.tenantId });
  if (!invoice) {
    return res.status(404).json({ success: false, message: "Invoice not found" });
  }

  const newAmountPaid = (Number(invoice.amountPaid) || 0) + paymentAmount;
  const newBalanceDue = Math.max(0, Number(invoice.grandTotal) - newAmountPaid);

  invoice.amountPaid = newAmountPaid;
  invoice.balanceDue = newBalanceDue;
  invoice.status = newBalanceDue === 0 ? "PAID" : "PARTIAL";

  await invoice.save();
  await sendPaymentReceiptEmail(invoice, paymentAmount);

  return res.status(200).json({
    success: true,
    message: `Payment of ₹${paymentAmount} recorded successfully!`,
    invoice,
    data: invoice,
  });
};

router.post("/:id/payment", async (req, res) => {
  try {
    return await recordPayment(req, res, req.params.id, req.body.amount);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/payment", async (req, res) => {
  try {
    const { invoiceId, id, amount } = req.body;
    const targetId = invoiceId || id;
    if (!targetId) {
      return res.status(400).json({ success: false, message: "Invoice ID is required" });
    }
    return await recordPayment(req, res, targetId, amount);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. UPDATE INVOICE STATUS
// PATCH /api/invoices/:id/status
// ==========================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const previousStatus = invoice.status;
    invoice.status = status;

    if (status === "PAID") {
      const paymentDifference = invoice.grandTotal - (invoice.amountPaid || 0);
      invoice.balanceDue = 0;
      invoice.amountPaid = invoice.grandTotal;

      if (previousStatus !== "PAID" && paymentDifference > 0) {
        await sendPaymentReceiptEmail(invoice, paymentDifference);
      }
    } else if (status === "PENDING") {
      invoice.balanceDue = invoice.grandTotal;
      invoice.amountPaid = 0;
    }

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice,
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. DELETE INVOICE
// DELETE /api/invoices/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!deletedInvoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;