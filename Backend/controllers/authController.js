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

const isValidFaceEmbedding = (value) =>
  Array.isArray(value) &&
  value.length >= 64 &&
  value.length <= 2048 &&
  value.every((entry) => Number.isFinite(entry));

const normalizeEmbedding = (embedding) => {
  if (!isValidFaceEmbedding(embedding)) return null;

  let magnitude = 0;
  for (let i = 0; i < embedding.length; i++) {
    magnitude += embedding[i] * embedding[i];
  }
  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) return null;

  const normalized = new Array(embedding.length);
  for (let i = 0; i < embedding.length; i++) {
    normalized[i] = embedding[i] / magnitude;
  }
  return normalized;
};

const getFaceMatchThreshold = () => {
  const configured = Number.parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.7");
  return Number.isFinite(configured) ? configured : 0.7;
};

const computeEuclideanDistance = (left, right) => {
  if (!isValidFaceEmbedding(left) || !isValidFaceEmbedding(right) || left.length !== right.length) {
    return Number.POSITIVE_INFINITY;
  }

  let squaredDistance = 0;

  for (let index = 0; index < left.length; index += 1) {
    const delta = left[index] - right[index];
    squaredDistance += delta * delta;
  }

  return Math.sqrt(squaredDistance);
};

const validateLivenessEvidence = (evidence) => {
  if (!Array.isArray(evidence) || evidence.length < 6 || evidence.length > 20) {
    return { passed: false, reason: "A complete multi-frame liveness sequence is required." };
  }

  const frames = evidence.filter((frame) => {
    return frame && Number.isFinite(frame.capturedAt)
      && Array.isArray(frame.box) && frame.box.length === 4
      && Array.isArray(frame.landmarks) && frame.landmarks.length === 6
      && Number.isFinite(frame.real) && Number.isFinite(frame.live);
  });

  if (frames.length !== evidence.length) {
    return { passed: false, reason: "Liveness evidence is incomplete or invalid." };
  }

  for (let index = 1; index < frames.length; index += 1) {
    if (frames[index].capturedAt <= frames[index - 1].capturedAt) {
      return { passed: false, reason: "Liveness frames must be captured in sequence." };
    }
  }

  const duration = frames[frames.length - 1].capturedAt - frames[0].capturedAt;
  const averageReal = frames.reduce((sum, frame) => sum + frame.real, 0) / frames.length;
  const averageLive = frames.reduce((sum, frame) => sum + frame.live, 0) / frames.length;
  const temporalVariation = (values) => Math.max(...values) - Math.min(...values);
  const boxVariation = Math.max(...[0, 1, 2, 3].map((coordinate) => temporalVariation(
    frames.map((frame) => frame.box[coordinate]),
  )));
  const landmarkVariation = Math.max(...[0, 1, 2, 3, 4, 5].flatMap((point) => [0, 1, 2].map((coordinate) => temporalVariation(
    frames.map((frame) => frame.landmarks[point][coordinate]),
  ))));

  const passed = duration >= 400
    && averageReal >= 0.5
    && averageLive >= 0.5
    && (boxVariation >= 0.001 || landmarkVariation >= 0.001);

  return {
    passed,
    reason: passed ? "" : "The camera could not confirm a live, continuously observed face.",
    frameCount: frames.length,
    duration,
    averageReal,
    averageLive,
    boxVariation,
    landmarkVariation,
  };
};

const evaluateFaceVerification = ({ storedEmbedding, faceEmbedding, livenessEvidence }) => {
  const liveness = validateLivenessEvidence(livenessEvidence);
  const normalizedStoredEmbedding = normalizeEmbedding(storedEmbedding);
  const normalizedLoginEmbedding = normalizeEmbedding(faceEmbedding);
  const distance = normalizedStoredEmbedding && normalizedLoginEmbedding
    ? computeEuclideanDistance(normalizedLoginEmbedding, normalizedStoredEmbedding)
    : Number.POSITIVE_INFINITY;
  const threshold = getFaceMatchThreshold();

  return {
    liveness,
    distance,
    threshold,
    comparisonPassed: Number.isFinite(distance) && distance <= threshold,
    passed: liveness.passed && Number.isFinite(distance) && distance <= threshold,
  };
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
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.fullName,
      resetUrl,
    });
    return { ok: true, resetUrl };
  } catch (error) {
    console.error("Password reset email send failed:", error.message || error);
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
      faceEmbedding,
      livenessEvidence,
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

    if (!isValidFaceEmbedding(faceEmbedding)) {
      return res.status(400).json({
        message: "Face verification is required before registration.",
      });
    }

    const liveness = validateLivenessEvidence(livenessEvidence);
    if (!liveness.passed) {
      return res.status(403).json({
        message: `Face anti-spoof verification failed. ${liveness.reason}`,
        antiSpoofPassed: false,
      });
    }

    const normalizedFaceEmbedding = normalizeEmbedding(faceEmbedding);
    if (!normalizedFaceEmbedding) {
      return res.status(400).json({
        message: "Face verification processing failed. Please try again.",
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
      faceEmbedding: normalizedFaceEmbedding,
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

    const user = await User.findOne({ email: normalizedEmail }).select("+faceEmbedding");

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

    if (!user.faceEmbedding || !isValidFaceEmbedding(user.faceEmbedding)) {
      return res.status(403).json({
        message: "Face verification is not available for this account.",
      });
    }

    const verificationToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        type: "face-verification",
      },
      process.env.JWT_SECRET,
      { expiresIn: Number(process.env.FACE_VERIFICATION_TTL_SECONDS || 120) }
    );

    return res.status(200).json({
      message: "Password verified. Please complete face verification to continue.",
      requiresFaceVerification: true,
      verificationToken,
      user: sanitizeUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

const verifyFaceLogin = async (req, res) => {
  try {
    const { verificationToken, faceEmbedding, livenessEvidence } = req.body;

    if (!verificationToken) {
      return res.status(401).json({
        message: "Face verification session is missing or expired.",
      });
    }

    if (!isValidFaceEmbedding(faceEmbedding)) {
      return res.status(400).json({
        message: "A valid face descriptor is required for verification.",
      });
    }

    const liveness = validateLivenessEvidence(livenessEvidence);
    if (!liveness.passed) {
      return res.status(403).json({
        message: `Face anti-spoof verification failed. ${liveness.reason}`,
        antiSpoofPassed: false,
      });
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(verificationToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Face verification session is expired or invalid.",
      });
    }

    if (decodedToken.type !== "face-verification") {
      return res.status(401).json({
        message: "Face verification session is invalid.",
      });
    }

    const user = await User.findById(decodedToken.userId).select("+faceEmbedding fullName email voterId role status hasVoted");

    if (!user) {
      return res.status(401).json({
        message: "Face verification session is invalid.",
      });
    }

    if (!user.faceEmbedding || !isValidFaceEmbedding(user.faceEmbedding)) {
      return res.status(403).json({
        message: "This account does not have a registered face profile.",
      });
    }

    // Normalize the login embedding
    const normalizedLoginEmbedding = normalizeEmbedding(faceEmbedding);
    if (!normalizedLoginEmbedding) {
      console.log("Face verification - Normalization failed:", {
        userId: String(decodedToken.userId),
        receivedEmbeddingLength: faceEmbedding.length,
      });
      return res.status(400).json({
        message: "Face verification processing failed. Please try again.",
      });
    }

    // Normalize stored embedding for comparison
    const normalizedStoredEmbedding = normalizeEmbedding(user.faceEmbedding);
    if (!normalizedStoredEmbedding) {
      console.log("Face verification - Stored embedding normalization failed:", {
        userId: String(decodedToken.userId),
      });
      return res.status(500).json({
        message: "Face verification processing failed. Please try again.",
      });
    }

    const evaluation = evaluateFaceVerification({
      storedEmbedding: user.faceEmbedding,
      faceEmbedding,
      livenessEvidence,
    });
    const { distance, threshold, comparisonPassed } = evaluation;

    if (process.env.FACE_VERIFICATION_DEBUG === "true") {
      console.log("Face verification attempt:", {
        userId: String(decodedToken.userId),
        storedEmbeddingLength: user.faceEmbedding.length,
        loginEmbeddingLength: faceEmbedding.length,
        distance: Number.isFinite(distance) ? Number(distance.toFixed(6)) : null,
        threshold: Number(threshold.toFixed(2)),
        antiSpoofPassed: liveness.passed,
        result: comparisonPassed ? "ACCEPTED" : "REJECTED",
      });
    }

    if (!comparisonPassed) {
      return res.status(403).json({
        message: "Face verification failed. Please try again with a matching face.",
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
    console.error("Face verification error:", error.message || error);

    return res.status(500).json({
      message: "Unable to verify face. Please try again.",
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
  verifyFaceLogin,
  forgotPassword,
  resetPassword,
  validateLivenessEvidence,
  evaluateFaceVerification,
};