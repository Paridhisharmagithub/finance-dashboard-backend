const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const {
  getSummary,
  getCategoryBreakdown,
  getRecentActivity,
  getTrends
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", protect, requireRoles("viewer", "analyst", "admin"), getSummary);
router.get("/category", protect, requireRoles("analyst", "admin"), getCategoryBreakdown);
router.get("/recent", protect, requireRoles("analyst", "admin"), getRecentActivity);
router.get("/trends", protect, requireRoles("analyst", "admin"), getTrends);

module.exports = router;