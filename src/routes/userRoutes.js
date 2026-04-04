const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus
} = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, requireRoles("admin"), getUsers);
router.get("/:id", protect, requireRoles("admin"), validateObjectId("id"), getUserById);
router.patch("/:id/role", protect, requireRoles("admin"), validateObjectId("id"), updateUserRole);
router.patch("/:id/status", protect, requireRoles("admin"), validateObjectId("id"), updateUserStatus);

module.exports = router;