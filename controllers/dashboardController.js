const Transaction = require("../models/Transaction");

// 🔹 Summary
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

// 🔹 Category-wise Breakdown
exports.getCategoryBreakdown = async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json(result);
};

// 🔹 Monthly Trends
exports.getMonthlyTrends = async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: { $month: "$date" },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
          }
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
          }
        }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.json(result);
};