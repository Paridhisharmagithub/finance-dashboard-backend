const Transaction = require("../models/Transaction");

exports.createTransaction = async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(transaction);
};

exports.getTransactions = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { category: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];
  }

  const transactions = await Transaction.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(transactions);
};

exports.updateTransaction = async (req, res) => {
  const updated = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

exports.deleteTransaction = async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};