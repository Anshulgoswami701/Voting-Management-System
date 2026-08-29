const User = require("../models/user");

// ==========================================
// GET ALL VOTERS
// ADMIN ONLY
// ==========================================

const getVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: "voter" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Voters fetched successfully",
      voters,
    });
  } catch (error) {
    console.error("Get voters error:", error);

    return res.status(500).json({
      message: "Server error while fetching voters",
    });
  }
};

// ==========================================
// GET SINGLE VOTER
// ADMIN ONLY
// ==========================================

const getVoterById = async (req, res) => {
  try {
    const { id } = req.params;

    const voter = await User.findOne({
      _id: id,
      role: "voter",
    }).select("-password");

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found",
      });
    }

    return res.status(200).json({
      message: "Voter fetched successfully",
      voter,
    });
  } catch (error) {
    console.error("Get voter error:", error);

    return res.status(500).json({
      message: "Server error while fetching voter",
    });
  }
};

// ==========================================
// UPDATE VOTER
// ADMIN ONLY
// ==========================================

const updateVoter = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      voterId,
      email,
    } = req.body;

    const voter = await User.findOne({
      _id: id,
      role: "voter",
    });

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found",
      });
    }

    // ==========================================
    // CHECK DUPLICATE VOTER ID
    // ==========================================

    if (voterId && voterId !== voter.voterId) {
      const existingVoter = await User.findOne({
        voterId,
        _id: { $ne: id },
      });

      if (existingVoter) {
        return res.status(409).json({
          message: "Voter ID already exists",
        });
      }
    }

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    if (email && email.toLowerCase() !== voter.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }
    }

    // ==========================================
    // UPDATE FIELDS
    // ==========================================

    if (fullName !== undefined) {
      voter.fullName = fullName.trim();
    }

    if (voterId !== undefined) {
      voter.voterId = voterId.trim();
    }

    if (email !== undefined) {
      voter.email = email.toLowerCase().trim();
    }

    await voter.save();

    return res.status(200).json({
      message: "Voter updated successfully",
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        voterId: voter.voterId,
        email: voter.email,
        role: voter.role,
        status: voter.status,
        hasVoted: voter.hasVoted,
        createdAt: voter.createdAt,
      },
    });
  } catch (error) {
    console.error("Update voter error:", error);

    return res.status(500).json({
      message: "Server error while updating voter",
    });
  }
};

// ==========================================
// BLOCK / UNBLOCK VOTER
// ADMIN ONLY
// ==========================================

const updateVoterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or blocked",
      });
    }

    const voter = await User.findOne({
      _id: id,
      role: "voter",
    });

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found",
      });
    }

    voter.status = status;

    await voter.save();

    return res.status(200).json({
      message: `Voter ${status === "active" ? "activated" : "blocked"} successfully`,
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        voterId: voter.voterId,
        email: voter.email,
        role: voter.role,
        status: voter.status,
        hasVoted: voter.hasVoted,
      },
    });
  } catch (error) {
    console.error("Update voter status error:", error);

    return res.status(500).json({
      message: "Server error while updating voter status",
    });
  }
};

// ==========================================
// DELETE VOTER
// ADMIN ONLY
// ==========================================

const deleteVoter = async (req, res) => {
  try {
    const { id } = req.params;

    const voter = await User.findOne({
      _id: id,
      role: "voter",
    });

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Voter deleted successfully",
    });
  } catch (error) {
    console.error("Delete voter error:", error);

    return res.status(500).json({
      message: "Server error while deleting voter",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getVoters,
  getVoterById,
  updateVoter,
  updateVoterStatus,
  deleteVoter,
};