const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'employee'], default: 'employee' },
  salary: { type: Number },
  insurance: { type: Number },
  // Settings Fields
  shopName: { type: String },
  logoUrl: { type: String },
  stampUrl: { type: String },
  phones: { type: [String], default: [] },
  website: { type: String },
  theme: { type: String, default: 'default' }, // 'default', 'midnight', 'forest', 'ocean', 'sunset'
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' } // Link to Tenant
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);