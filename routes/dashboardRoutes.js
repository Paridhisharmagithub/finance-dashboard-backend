const express = require("express");
const router = express.Router();

const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

router.get("/summary", protect, getSummary);
router.get("/category", protect, getCategoryBreakdown);
router.get("/trends", protect, getMonthlyTrends);

module.exports = router;