const express = require("express");

const {
  register,
  login,
  verifyFaceLogin,
  forgotPassword,
  resetPassword,
  createPadChallenge,
  verifyPad,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", register);

router.post("/pad-challenge", (req, res) => {
  res.status(200).json({ challengeToken: createPadChallenge("registration-pad") });
});

router.post("/verify-pad", verifyPad);

// Login
router.post("/login", login);

// Face verification for login
router.post("/verify-face", verifyFaceLogin);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;