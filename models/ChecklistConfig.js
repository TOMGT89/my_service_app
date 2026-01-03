const mongoose = require('mongoose');

// Το σχέδιο για κάθε κατηγορία (π.χ. ΦΡΕΝΑ)
const CategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true }, // Σειρά εμφάνισης (1, 2, 3...)
  availableActions: [{ type: String }],    // Τι κουτάκια θα έχει (π.χ. ΑΛΛΑΓΗ, ΕΛΕΓΧΟΣ)
  items: [String]                          // Τα αντικείμενα (π.χ. ΤΑΚΑΚΙΑ, ΔΙΣΚΟΠΛΑΚΕΣ)
});

const ChecklistConfigSchema = new mongoose.Schema({
  version: { type: String, default: '1.0' },
  categories: [CategorySchema]
});

module.exports = mongoose.model('ChecklistConfig', ChecklistConfigSchema);