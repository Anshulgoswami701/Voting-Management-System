const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Election = require("../models/election");
const Candidate = require("../models/candidate");
const Vote = require("../models/vote");

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalVoters, verifiedVoters, totalElections, activeElections, upcomingElections, completedElections, totalCandidates, totalVotes] = await Promise.all([
      User.countDocuments({ role: "voter" }),
      User.countDocuments({ role: "voter", verificationStatus: "verified" }),
      Election.countDocuments(),
      Election.countDocuments({ status: "active" }),
      Election.countDocuments({ status: "upcoming" }),
      Election.countDocuments({ status: { $in: ["ended", "results_published"] } }),
      Candidate.countDocuments(),
      Vote.countDocuments(),
    ]);

    const recentElections = await Election.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentVoters = await User.find({ role: "voter" }).sort({ createdAt: -1 }).limit(5).select("fullName email createdAt status verificationStatus").lean();

    return res.status(200).json({
      stats: {
        totalVoters,
        verifiedVoters,
        totalElections,
        activeElections,
        upcomingElections,
        completedElections,
        totalCandidates,
        totalVotes,
      },
      recentElections,
      recentVoters,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ message: "Unable to load admin dashboard data" });
  }
});

module.exports = router;
