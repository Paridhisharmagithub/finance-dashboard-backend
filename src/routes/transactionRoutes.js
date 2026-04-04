const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", protect, requireRoles("analyst", "admin"), getTransactions);
router.post("/", protect, requireRoles("admin"), createTransaction);
router.put("/:id", protect, requireRoles("admin"), validateObjectId("id"), updateTransaction);
router.delete("/:id", protect, requireRoles("admin"), validateObjectId("id"), deleteTransaction);

module.exports = router;