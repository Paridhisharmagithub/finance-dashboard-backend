const Transaction = require("../models/Transaction");

exports.createTransaction = async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(transaction);
};

exports.getTransactions = async (req, res) => {
  const { type, category } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;

  const transactions = await Transaction.find(filter);
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