const mongoose = require('mongoose');

const RecurringExpenseSchema = new mongoose.Schema({
  title: String,  // π.χ. "Ενοίκιο Καταστήματος"
  amount: Number  // π.χ. 600
});

module.exports = mongoose.model('RecurringExpense', RecurringExpenseSchema);