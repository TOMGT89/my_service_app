const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);