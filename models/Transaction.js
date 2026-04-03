const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  type: { type: String, enum: ["income", "expense"] },
  category: String,
  date: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);