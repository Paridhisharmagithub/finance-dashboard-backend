const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;

  if (statusCode === 200) statusCode = 500;

  let message = err.message || "Internal Server Error";

  /* 🔥 MONGOOSE CAST ERROR */
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  /* 🔥 DUPLICATE KEY ERROR */
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  /* 🔥 VALIDATION ERROR */
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  /* 🔥 JWT ERRORS */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  /* 🔥 CUSTOM API ERROR */
  if (err.isOperational) {
    message = err.message;
  }

  /* 🔥 FINAL RESPONSE */
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack
    })
  });
};

module.exports = errorHandler;