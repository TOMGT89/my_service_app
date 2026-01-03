const mongoose = require('mongoose');

const ServiceRecordSchema = new mongoose.Schema({
  vehiclePlate: String,
  mechanic: String,
  servicesPerformed: Array,
  generalNotes: String,
  status: { type: String, default: 'Pending' },
  completedAt: Date,
  date: { type: Date, default: Date.now },
  price: { type: Number, default: 0 },      // Τιμή Χρέωσης (Έσοδο)
  partsCost: { type: Number, default: 0 }   // ΝΕΟ: Κόστος Ανταλλακτικών (Έξοδο)
});

module.exports = mongoose.model('ServiceRecord', ServiceRecordSchema);