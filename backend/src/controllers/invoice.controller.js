import Invoice from "../models/invoice.model.js";

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
      invoices,
    });
  } catch (error) {
    console.error("Get Invoices Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve invoices.",
    });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const newInvoice = await Invoice.create({
      ...req.body,
      tenantId: req.tenantId,
      userId: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully!",
      data: newInvoice,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create invoice.",
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }
    return res.status(200).json({ success: true, data: invoice, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch invoice." });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }
    return res.status(200).json({ success: true, message: "Invoice deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete invoice." });
  }
};
