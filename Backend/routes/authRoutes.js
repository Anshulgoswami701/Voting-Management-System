const express = require("express");

const {
  register,
  login,
  verifyFaceLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Face verification for login
router.post("/verify-face", verifyFaceLogin);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;