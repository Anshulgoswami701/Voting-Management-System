const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// REGISTER USER
// ==========================================

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
    } = req.body;

    // ==========================================
    // 1. REQUIRED FIELDS
    // ==========================================

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // ==========================================
    // 2. PASSWORD CONFIRMATION
    // ==========================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // ==========================================
    // 3. CHECK ROLE
    // ==========================================

    if (!["voter", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // ==========================================
    // VOTER VALIDATION
    // ==========================================

    if (role === "voter") {
      if (!voterId) {
        return res.status(400).json({
          message: "Voter ID is required",
        });
      }

      const existingVoter = await User.findOne({
        voterId,
      });

      if (existingVoter) {
        return res.status(409).json({
          message: "Voter ID already registered",
        });
      }
    }

    // ==========================================
    // ADMIN VALIDATION
    // ==========================================

    if (role === "admin") {
      if (!adminCode) {
        return res.status(400).json({
          message: "Admin secret code is required",
        });
      }

      if (adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({
          message: "Invalid admin secret code",
        });
      }

      // const existingAdmin = await User.findOne({
      //   role: "admin",
      // });

      // if (existingAdmin) {
      //   return res.status(409).json({
      //     message: "Admin already exists. Only one admin is allowed.",
      //   });
      // }
    }

    // ==========================================
    // CHECK EMAIL
    // ==========================================

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // CREATE USER
    // ==========================================

    const user = await User.create({
      fullName,
      voterId: role === "voter" ? voterId : undefined,
      email,
      password: hashedPassword,
      role,
    });

    // ==========================================
    // REGISTRATION RESPONSE
    // ==========================================

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        voterId: user.voterId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // ==========================================
    // 1. REQUIRED FIELDS
    // ==========================================

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required",
      });
    }

    // ==========================================
    // 2. CHECK ROLE
    // ==========================================

    if (!["voter", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // ==========================================
    // 3. FIND USER BY EMAIL
    // ==========================================

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // 4. CHECK USER ROLE
    // ==========================================

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}`,
      });
    }

    // ==========================================
    // 5. CHECK PASSWORD
    // ==========================================

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // 6. CREATE JWT TOKEN
    // ==========================================

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ==========================================
    // 7. LOGIN RESPONSE
    // ==========================================

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        voterId: user.voterId,
        role: user.role,
        hasVoted: user.hasVoted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  register,
  login,
};