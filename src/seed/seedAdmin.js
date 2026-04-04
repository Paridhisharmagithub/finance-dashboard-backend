require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "System Admin";
  const email = (process.env.ADMIN_EMAIL || "admin@finance.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.role = "admin";
    existing.isActive = true;
    existing.password = hashedPassword;
    await existing.save();

    console.log("Admin user updated successfully");
  } else {
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true
    });

    console.log("Admin user created successfully");
  }

  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});