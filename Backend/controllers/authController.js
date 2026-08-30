const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../services/emailService");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => emailRegex.test(normalizeEmail(email));

const isStrongPassword = (password) => {
  if (typeof password !== "string") return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password.trim());
};

const sanitizeUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  voterId: user.voterId,
  role: user.role,
  status: user.status,
  hasVoted: user.hasVoted,
});

const sendResetEmail = async (user, token) => {
  const resetUrl = `${process.env.APP_BASE_URL || "http://localhost:5173"}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.fullName,
      resetUrl,
    });
    return { ok: true, resetUrl };
  } catch (error) {
    console.error("Password reset email send failed:", error.message);
    return { ok: false, resetUrl };
  }
};

const register = async (req, res) => {
  try {
    const {
      fullName,
      voterId,
      email,
      password,
      confirmPassword,
      adminCode,
      role,
      termsAccepted,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!["voter", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account type.",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (termsAccepted !== true && termsAccepted !== "true") {
      return res.status(400).json({
        message: "You must accept the Terms & Conditions and Privacy Policy before registering.",
      });
    }

    if (role === "voter") {
      const normalizedVoterId = String(voterId || "").trim();

      if (!normalizedVoterId) {
        return res.status(400).json({
          message: "Voter ID is required.",
        });
      }

      const existingVoter = await User.findOne({
        voterId: normalizedVoterId.toUpperCase(),
      });

      if (existingVoter) {
        return res.status(409).json({
          message: "This Voter ID is already registered. Please use a unique Voter ID.",
        });
      }
    }

    if (role === "admin") {
      if (!adminCode) {
        return res.status(400).json({
          message: "Admin secret code is required.",
        });
      }

      if (adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({
          message: "Invalid admin secret code.",
        });
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      voterId: role === "voter" ? String(voterId).trim().toUpperCase() : undefined,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      status: "active",
      termsAccepted: true,
      acceptedAt: new Date(),
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: sanitizeUserResponse(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message =
        field === "voterId"
          ? "This Voter ID is already registered. Please use a unique Voter ID."
          : "An account with this email already exists.";

      return res.status(409).json({ message });
    }

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required.",
      });
    }

    if (!["voter", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}.`,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.role === "voter" && user.status === "blocked") {
      return res.status(403).json({
        message: "Your voter account has been blocked by admin.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    const rawToken = user.generatePasswordResetToken();
    await user.save();

    const emailSendResult = await sendResetEmail(user, rawToken);

    if (!emailSendResult.ok) {
      return res.status(500).json({
        message: "Unable to send password reset email right now. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "If an account with that email exists, a reset link has been sent.",
      resetUrl: emailSendResult.resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Unable to process password reset request.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required.",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirmation are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");

    const user = await User.findOne({
      resetTokenHash: hashedToken,
      resetTokenExpiresAt: { $gt: new Date() },
      resetTokenUsedAt: null,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired reset token.",
      });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.clearPasswordResetToken();
    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Unable to reset password.",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};