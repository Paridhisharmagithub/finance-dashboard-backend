const ApiError = require("../utils/ApiError");

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(500, "Auth middleware must run before role middleware"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied: insufficient permissions"));
    }

    next();
  };
};

module.exports = { requireRoles };