const Transaction = require("../models/Transaction");

exports.getSummary = async (req, res) => {
  const transactions = await Transaction.find();

  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  res.json({
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense
  });
};