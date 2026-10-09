import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { attachTenantDB } from "../middleware/tenant.middleware.js";
import Customer from "../models/customer.model.js";

const router = express.Router();

// 1. Guard all customer routes
router.use(protect, attachTenantDB);

// 2. GET ALL CUSTOMERS
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({ tenantId: req.tenantId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
      data: customers,
    });
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve customers.",
    });
  }
});

// 3. GET SINGLE CUSTOMER
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 4. CREATE NEW CUSTOMER
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, company, address, notes, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const newCustomer = await Customer.create({
      tenantId: req.tenantId,
      name,
      email: email || "",
      phone: phone || "",
      company: company || "",
      address: address || {},
      notes: notes || "",
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: newCustomer,
      data: newCustomer,
    });
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 5. UPDATE CUSTOMER
router.put("/:id", async (req, res) => {
  try {
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: updated,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 6. DELETE CUSTOMER
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Customer.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;