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

/* -------------------- VALIDATION BUILDER -------------------- */

const buildTransactionPayload = (body, { partial = false } = {}) => {
  const payload = {};

  // Amount
  if (!partial || body.amount !== undefined) {
    const amount = toPositiveNumber(body.amount);
    if (amount === null) {
      throw new ApiError(400, "Amount must be a positive number");
    }
    payload.amount = amount;
  }

  // Type
  if (!partial || body.type !== undefined) {
    const type = toTrimmedString(body.type).toLowerCase();
    if (!ALLOWED_TRANSACTION_TYPES.includes(type)) {
      throw new ApiError(400, "Type must be income or expense");
    }
    payload.type = type;
  }

  // Category
  if (!partial || body.category !== undefined) {
    const category = toTrimmedString(body.category).toLowerCase();
    if (!category || category.length < 2) {
      throw new ApiError(400, "Category must be at least 2 characters");
    }
    payload.category = category;
  }

  // Date
  if (!partial || body.date !== undefined) {
    const date = body.date ? parseDate(body.date) : new Date();
    if (!date) throw new ApiError(400, "Invalid date");
    payload.date = date;
  }

  // Notes
  if (!partial || body.notes !== undefined) {
    payload.notes = toTrimmedString(body.notes || "");
  }

  return payload;
};

/* -------------------- GET TRANSACTIONS -------------------- */

const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  // 🔥 ADD THIS HERE
  if (req.query.startDate || req.query.endDate) {
    filter.date = {};

    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      if (isNaN(startDate)) {
        throw new ApiError(400, "Invalid startDate");
      }
      filter.date.$gte = startDate;
    }

    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      if (isNaN(endDate)) {
        throw new ApiError(400, "Invalid endDate");
      }
      filter.date.$lte = endDate;
    }
  }

  // Soft delete filter
  if (!(req.user.role === "admin" && req.query.includeDeleted === "true")) {
    filter.isDeleted = false;
  }

  // Type filter
  if (req.query.type) {
    filter.type = req.query.type.toLowerCase();
  }

  // Category filter
  if (req.query.category) {
    filter.category = {
      $regex: escapeRegExp(req.query.category),
      $options: "i"
    };
  }

  // Search
  if (req.query.search) {
    const search = escapeRegExp(req.query.search);
    filter.$or = [
      { category: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];
  }

  // Date filter
  if (req.query.startDate || req.query.endDate) {
    filter.date = {};

    if (req.query.startDate) {
      const start = parseDate(req.query.startDate);
      if (!start) throw new ApiError(400, "Invalid startDate");
      filter.date.$gte = start;
    }

    if (req.query.endDate) {
      const end = parseDate(req.query.endDate);
      if (!end) throw new ApiError(400, "Invalid endDate");
      filter.date.$lte = end;
    }
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role"),

    Transaction.countDocuments(filter)
  ]);

  res.json({
    data: transactions,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/* -------------------- CREATE -------------------- */

const createTransaction = asyncHandler(async (req, res) => {
  const payload = buildTransactionPayload(req.body);

  const transaction = await Transaction.create({
    ...payload,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  res.status(201).json({
    message: "Transaction created",
    data: transaction
  });
});

/* -------------------- UPDATE -------------------- */

const updateTransaction = asyncHandler(async (req, res) => {
  const payload = buildTransactionPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      ...payload,
      updatedBy: req.user._id
    },
    { new: true }
  );

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  res.json({
    message: "Transaction updated",
    data: transaction
  });
});

/* -------------------- DELETE (SOFT DELETE) -------------------- */

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: req.user._id
    }
  );

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  res.json({
    message: "Transaction deleted"
  });
});

/* -------------------- EXPORT -------------------- */

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};