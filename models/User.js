const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  salary: { type: Number },     
  insurance: { type: Number },  
  // Settings Fields
  shopName: { type: String },
  logoUrl: { type: String },
  stampUrl: { type: String }, // ΝΕΟ: Σφραγίδα
  phones: { type: [String], default: [] }, // ΝΕΟ: Πίνακας με τηλέφωνα
  website: { type: String } // ΝΕΟ: Site
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);