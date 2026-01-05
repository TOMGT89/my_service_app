const mongoose = require('mongoose');

const RecurringExpenseSchema = new mongoose.Schema({
  title: String,  // π.χ. "Ενοίκιο Καταστήματος"
  amount: Number,  // π.χ. 600
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }
});

module.exports = mongoose.model('RecurringExpense', RecurringExpenseSchema);