const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const authMiddleware = async (req, res, next) => {
  try {
    // ==========================================
    // 1. GET TOKEN FROM HEADER
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    // Expected:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    // ==========================================
    // 2. VERIFY JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // 3. CHECK USER FROM DATABASE
    // ==========================================

    const user = await User.findById(decoded.userId).select(
      "role status"
    );

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    // ==========================================
    // 4. CHECK BLOCKED VOTER
    // ==========================================

    if (
      user.role === "voter" &&
      user.status === "blocked"
    ) {
      return res.status(403).json({
        message: "Your voter account has been blocked by admin",
        code: "ACCOUNT_BLOCKED",
      });
    }

    // ==========================================
    // 5. SAVE CURRENT USER INFORMATION
    // ==========================================

    req.user = {
      userId: user._id,
      role: user.role,
      status: user.status,
    };

    // ==========================================
    // 6. CONTINUE
    // ==========================================

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = authMiddleware;