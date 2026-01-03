const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  brand: String,
  model: String,
  ownerName: String, // ΝΕΟ: Όνομα Ιδιοκτήτη
  ownerPhone: String,
  lastService: Date
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);