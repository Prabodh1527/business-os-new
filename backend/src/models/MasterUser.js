const mongoose = require('mongoose');

const masterUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true },
  tenantDbName: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = masterUserSchema;