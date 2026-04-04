const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const {
  ALLOWED_ROLES,
  toBoolean,
  toTrimmedString
} = require("../utils/validators");

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.role) {
    if (!ALLOWED_ROLES.includes(req.query.role)) {
      throw new ApiError(400, "Invalid role filter");
    }
    filter.role = req.query.role;
  }

  if (typeof req.query.isActive !== "undefined") {
    const parsed = toBoolean(req.query.isActive);
    if (parsed === null) {
      throw new ApiError(400, "Invalid isActive filter");
    }
    filter.isActive = parsed;
  }

  if (req.query.search) {
    const search = toTrimmedString(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({
    data: users.map(publicUser),
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    data: publicUser(user)
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const role = toTrimmedString(req.body.role);

  if (!ALLOWED_ROLES.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    message: "User role updated successfully",
    data: publicUser(user)
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const isActive = toBoolean(req.body.isActive);

  if (isActive === null) {
    throw new ApiError(400, "isActive must be a boolean value");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    message: `User has been ${isActive ? "activated" : "deactivated"}`,
    data: publicUser(user)
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus
};