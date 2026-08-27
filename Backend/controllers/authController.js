const User = require("../models/user");
const bcrypt = require("bcryptjs");

// ==========================
// REGISTER USER
// ==========================
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

    // 1. Required fields check
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // 2. Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 3. Check role
    if (!["voter", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // 4. Voter ID required for voter
    if (role === "voter" && !voterId) {
      return res.status(400).json({
        message: "Voter ID is required",
      });
    }

    // 5. Admin secret code check
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
    }

    // 6. Check email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 7. Check voter ID already exists
    if (role === "voter") {
      const existingVoter = await User.findOne({ voterId });

      if (existingVoter) {
        return res.status(409).json({
          message: "Voter ID already registered",
        });
      }
    }

    // 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Create user
    const user = await User.create({
      fullName,
      voterId: role === "voter" ? voterId : undefined,
      email,
      password: hashedPassword,
      role,
    });

    // 10. Send response
    res.status(201).json({
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

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

module.exports = {
  register,
};