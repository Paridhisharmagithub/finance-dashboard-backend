const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const { generateToken } = require("../utils/jwt");
const {
  isValidEmail,
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

const register = asyncHandler(async (req, res) => {
  const name = toTrimmedString(req.body.name);
  const email = toTrimmedString(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "viewer",
    isActive: true
  });

  const token = generateToken(user);

  res.status(201).json({
    message: "User registered successfully",
    token,
    data: publicUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const email = toTrimmedString(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user);

  res.json({
    message: "Login successful",
    token,
    data: publicUser(user)
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    data: publicUser(req.user)
  });
});

module.exports = {
  register,
  login,
  getMe
};