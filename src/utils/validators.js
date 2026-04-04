const ALLOWED_ROLES = ["viewer", "analyst", "admin"];
const ALLOWED_TRANSACTION_TYPES = ["income", "expense"];

const isValidEmail = (value) => {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
};

const toTrimmedString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const toPositiveNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }

  return null;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const escapeRegExp = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = {
  ALLOWED_ROLES,
  ALLOWED_TRANSACTION_TYPES,
  isValidEmail,
  toTrimmedString,
  toPositiveNumber,
  toBoolean,
  parseDate,
  escapeRegExp
};