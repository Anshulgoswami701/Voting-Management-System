// ==========================================
// ADMIN ONLY MIDDLEWARE
// ==========================================

const adminMiddleware = (req, res, next) => {
  // Check if user information exists
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  // Check user role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  // User is admin
  next();
};

module.exports = adminMiddleware;