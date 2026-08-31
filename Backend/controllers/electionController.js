const Election = require("../models/election");
const Candidate = require("../models/candidate");
const User = require("../models/User");
const Vote = require("../models/vote");

// ==========================================
// UPDATE ELECTION STATUSES
// ==========================================

const updateElectionStatuses = async () => {
  try {
    const now = new Date();

    await Election.updateMany(
      {
        resultsPublished: true,
        status: { $ne: "results_published" },
      },
      {
        $set: {
          status: "results_published",
        },
      }
    );

    // UPCOMING
    await Election.updateMany(
      {
        startDate: { $gt: now },
        status: { $ne: "results_published" },
        resultsPublished: { $ne: true },
      },
      {
        $set: {
          status: "upcoming",
        },
      }
    );

    // ACTIVE
    await Election.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gt: now },
        status: { $ne: "results_published" },
        resultsPublished: { $ne: true },
      },
      {
        $set: {
          status: "active",
        },
      }
    );

    // ENDED
    await Election.updateMany(
      {
        endDate: { $lte: now },
        status: { $ne: "results_published" },
        resultsPublished: { $ne: true },
      },
      {
        $set: {
          status: "ended",
        },
      }
    );
  } catch (error) {
    console.error(
      "Update election statuses error:",
      error
    );
  }
};

// ==========================================
// CREATE ELECTION
// ADMIN ONLY
// ==========================================

const createElection = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
    } = req.body;

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        message: "Start date cannot be in the past",
      });
    }

    if (end < today) {
      return res.status(400).json({
        message: "End date cannot be in the past",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const election = await Election.create({
      title: title.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      status: "upcoming",
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Election created successfully",
      election,
    });
  } catch (error) {
    console.error(
      "Create election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating election",
    });
  }
};

// ==========================================
// GET ALL ELECTIONS
// ADMIN ONLY
// ==========================================

const getElections = async (req, res) => {
  try {
    await updateElectionStatuses();

    const elections = await Election.find()
      .populate(
        "createdBy",
        "fullName email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message:
        "Elections fetched successfully",
      elections,
    });
  } catch (error) {
    console.error(
      "Get elections error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching elections",
    });
  }
};

// ==========================================
// GET SINGLE ELECTION
// ADMIN ONLY
// ==========================================

const getElectionById = async (req, res) => {
  try {
    await updateElectionStatuses();

    const { id } = req.params;

    const election =
      await Election.findById(id).populate(
        "createdBy",
        "fullName email"
      );

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    return res.status(200).json({
      message:
        "Election fetched successfully",
      election,
    });
  } catch (error) {
    console.error(
      "Get election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching election",
    });
  }
};

// ==========================================
// UPDATE ELECTION
// ADMIN ONLY
// ==========================================

const updateElection = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      startDate,
      endDate,
    } = req.body;

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        message: "Start date cannot be in the past",
      });
    }

    if (end < today) {
      return res.status(400).json({
        message: "End date cannot be in the past",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be after start date",
      });
    }

    election.title = title.trim();

    election.description =
      description.trim();

    election.startDate = start;
    election.endDate = end;

    const now = new Date();

    if (end <= now) {
      election.status = "ended";
    } else if (
      start <= now &&
      end > now
    ) {
      election.status = "active";
    } else {
      election.status = "upcoming";
    }

    await election.save();

    return res.status(200).json({
      message:
        "Election updated successfully",
      election,
    });
  } catch (error) {
    console.error(
      "Update election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating election",
    });
  }
};

// ==========================================
// DELETE ELECTION
// ADMIN ONLY
// ==========================================

const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    await Election.findByIdAndDelete(id);

    // Delete candidates belonging to election
    await Candidate.deleteMany({
      election: id,
    });

    return res.status(200).json({
      message:
        "Election deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting election",
    });
  }
};

// ==========================================
// GET ACTIVE ELECTIONS
// VOTER ONLY
// ==========================================

const getActiveElectionsForVoter = async (
  req,
  res
) => {
  try {
    await updateElectionStatuses();

    const elections = await Election.find({
      status: "active",
    })
      .select(
        "title description startDate endDate status"
      )
      .sort({ startDate: 1 });

    return res.status(200).json({
      message:
        "Active elections fetched successfully",
      elections,
    });
  } catch (error) {
    console.error(
      "Get active elections error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching active elections",
    });
  }
};

// ==========================================
// GET VOTER ELECTION DETAILS
// VOTER ONLY
// ==========================================

const getVoterElectionById = async (
  req,
  res
) => {
  try {
    await updateElectionStatuses();

    const { id } = req.params;

    const election =
      await Election.findById(id).select(
        "title description startDate endDate status resultsPublished"
      );

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    const candidates =
      await Candidate.find({
        election: id,
      }).sort({
        createdAt: 1,
      });

    return res.status(200).json({
      message:
        "Election details fetched successfully",

      election,

      candidates,
    });
  } catch (error) {
    console.error(
      "Get voter election details error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching election details",
    });
  }
};

const getVoterElections = async (req, res) => {
  try {
    await updateElectionStatuses();

    const { userId } = req.user;

    const voter = await User.findById(userId);
    if (!voter || voter.role !== "voter") {
      return res.status(403).json({ message: "Access denied. Voter only." });
    }

    const elections = await Election.find().sort({ startDate: 1 }).lean();
    const votedElectionIds = await Vote.distinct("election", { voter: userId });

    const enriched = elections.map((election) => {
      const hasVoted = votedElectionIds.some((id) => id.toString() === election._id.toString());
      const now = new Date();
      let votingStatus = "not_started";

      if (election.status === "upcoming") votingStatus = "upcoming";
      if (election.status === "active") votingStatus = hasVoted ? "already_voted" : "active";
      if (election.status === "ended") votingStatus = hasVoted ? "voted" : "ended";
      if (election.status === "results_published") votingStatus = "results_published";

      return {
        ...election,
        votingStatus,
        hasVoted,
      };
    });

    return res.status(200).json({
      message: "Voter elections fetched successfully",
      elections: enriched,
    });
  } catch (error) {
    console.error("Get voter elections error:", error);
    return res.status(500).json({ message: "Server error while fetching voter elections" });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  updateElectionStatuses,

  // VOTER
  getActiveElectionsForVoter,
  getVoterElectionById,
  getVoterElections,
};