const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");

const baseMatch = { isDeleted: false };

const getSummary = asyncHandler(async (req, res) => {
  const [result = {}] = await Transaction.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
          }
        },
        transactionCount: { $sum: 1 }
      }
    }
  ]);

  const totalIncome = result.totalIncome || 0;
  const totalExpense = result.totalExpense || 0;

  res.json({
    data: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: result.transactionCount || 0
    }
  });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        incomeAmount: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
          }
        },
        expenseAmount: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  res.json({ data });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);

  const data = await Transaction.find(baseMatch)
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(limit)
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  res.json({ data });
});

const getTrends = asyncHandler(async (req, res) => {
  const period = (req.query.period || "monthly").toLowerCase();

  if (!["monthly", "weekly"].includes(period)) {
    throw new ApiError(400, "period must be monthly or weekly");
  }

  const groupStage =
    period === "weekly"
      ? {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" }
          }
        }
      : {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          }
        };

  const data = await Transaction.aggregate([
    { $match: baseMatch },
    {
      $group: {
        ...groupStage,
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
          }
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort:
        period === "weekly"
          ? { "_id.year": 1, "_id.week": 1 }
          : { "_id.year": 1, "_id.month": 1 }
    }
  ]);

  const formatted = data.map((item) => {
    if (period === "weekly") {
      return {
        label: `W${item._id.week} ${item._id.year}`,
        year: item._id.year,
        week: item._id.week,
        income: item.income,
        expense: item.expense,
        netBalance: item.income - item.expense,
        count: item.count
      };
    }

    const monthDate = new Date(item._id.year, item._id.month - 1, 1);
    return {
      label: monthDate.toLocaleString("en-US", { month: "short", year: "numeric" }),
      year: item._id.year,
      month: item._id.month,
      income: item.income,
      expense: item.expense,
      netBalance: item.income - item.expense,
      count: item.count
    };
  });

  res.json({
    period,
    data: formatted
  });
});

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getRecentActivity,
  getTrends
};