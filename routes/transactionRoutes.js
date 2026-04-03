const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("admin"), createTransaction);
router.get("/", protect, getTransactions);
router.put("/:id", protect, authorize("admin"), updateTransaction);
router.delete("/:id", protect, authorize("admin"), deleteTransaction);

module.exports = router;