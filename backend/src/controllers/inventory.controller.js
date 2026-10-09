import Inventory from '../models/inventory.model.js';

// GET /api/inventory - Only returns items belonging to the active tenant
export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ tenantId: req.tenantId });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/inventory - Saves item bound to current tenant
export const createInventoryItem = async (req, res) => {
  try {
    const newItem = await Inventory.create({
      ...req.body,
      tenantId: req.tenantId, // Auto-bind item to logged-in company
    });
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};