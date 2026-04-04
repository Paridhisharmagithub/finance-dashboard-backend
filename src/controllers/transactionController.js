const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const {
  ALLOWED_TRANSACTION_TYPES,
  escapeRegExp,
  parseDate,
  toPositiveNumber,
  toTrimmedString
} = require("../utils/validators");

const buildTransactionPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || typeof body.amount !== "undefined") {
    const amount = toPositiveNumber(body.amount);
    if (amount === null) {
      throw new ApiError(400, "Amount must be a positive number");
    }
    payload.amount = amount;
  }

  if (!partial || typeof body.type !== "undefined") {
    const type = toTrimmedString(body.type).toLowerCase();
    if (!ALLOWED_TRANSACTION_TYPES.includes(type)) {
      throw new ApiError(400, "Type must be either income or expense");
    }
    payload.type = type;
  }

  if (!partial || typeof body.category !== "undefined") {
    const category = toTrimmedString(body.category).toLowerCase();
    if (!category) {
      throw new ApiError(400, "Category is required");
    }
    if (category.length < 2) {
      throw new ApiError(400, "Category must be at least 2 characters");
    }
    payload.category = category;
  }

  if (!partial || typeof body.date !== "undefined") {
    const date = body.date ? parseDate(body.date) : new Date();
    if (!date) {
      throw new ApiError(400, "Invalid date");
    }
    payload.date = date;
  }

  if (!partial || typeof body.notes !== "undefined") {
    payload.notes = toTrimmedString(body.notes || "");
  }

  return payload;
};

const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const allowedSortFields = ["date", "createdAt", "updatedAt", "amount", "category", "type"];
  const sortBy = req.query.sortBy || "date";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sortBy field");
  }

  const filter = {};

  const includeDeleted =
    req.user.role === "admin" && String(req.query.includeDeleted).toLowerCase() === "true";

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (req.query.type) {
    const type = toTrimmedString(req.query.type).toLowerCase();
    if (!ALLOWED_TRANSACTION_TYPES.includes(type)) {
      throw new ApiError(400, "Invalid type filter");
    }
    filter.type = type;
  }

  if (req.query.category) {
    const category = escapeRegExp(toTrimmedString(req.query.category).toLowerCase());
    filter.category = { $regex: `^${category}$`, $options: "i" };
  }

  if (req.query.search) {
    const search = escapeRegExp(toTrimmedString(req.query.search));
    filter.$or = [
      { category: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];
  }

  if (req.query.startDate || req.query.endDate) {
    filter.date = {};

    if (req.query.startDate) {
      const startDate = parseDate(req.query.startDate);
      if (!startDate) throw new ApiError(400, "Invalid startDate");
      filter.date.$gte = startDate;
    }

    if (req.query.endDate) {
      const endDate = parseDate(req.query.endDate);
      if (!endDate) throw new ApiError(400, "Invalid endDate");
      filter.date.$lte = endDate;
    }
  }

  const [data, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role"),
    Transaction.countDocuments(filter)
  ]);

  res.json({
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const createTransaction = asyncHandler(async (req, res) => {
  const payload = buildTransactionPayload(req.body, { partial: false });

  const transaction = await Transaction.create({
    ...payload,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  const populated = await transaction.populate("createdBy", "name email role");

  res.status(201).json({
    message: "Transaction created successfully",
    data: populated
  });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const payload = buildTransactionPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      ...payload,
      updatedBy: req.user._id
    },
    { new: true, runValidators: true }
  )
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  res.json({
    message: "Transaction updated successfully",
    data: transaction
  });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: req.user._id
    },
    { new: true }
  );

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  res.json({
    message: "Transaction deleted successfully"
  });
});

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};