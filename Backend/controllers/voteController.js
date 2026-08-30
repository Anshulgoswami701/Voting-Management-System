const Vote = require("../models/vote");
const User = require("../models/User");
const Election = require("../models/election");
const Candidate = require("../models/candidate");

// ==========================================
// GET ACTIVE ELECTIONS FOR VOTER
// ==========================================

const getActiveElections = async (req, res) => {
  try {
    const now = new Date();

    const elections = await Election.find({
      startDate: { $lte: now },
      endDate: { $gt: now },
      status: "active",
    }).sort({
      startDate: 1,
    });

    return res.status(200).json({
      message: "Active elections fetched successfully",
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
// GET CANDIDATES FOR VOTER
// ==========================================

const getCandidatesForVoter = async (req, res) => {
  try {
    const { electionId } = req.params;

    // ==========================================
    // CHECK ELECTION
    // ==========================================

    const election = await Election.findById(
      electionId
    );

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    // ==========================================
    // CHECK ELECTION STATUS
    // ==========================================

    const now = new Date();

    if (
      election.status !== "active" ||
      election.startDate > now ||
      election.endDate <= now
    ) {
      return res.status(400).json({
        message:
          "This election is not currently active",
      });
    }

    // ==========================================
    // CHECK VOTER
    // ==========================================

    const voter = await User.findById(
      req.user.userId
    );

    if (!voter) {
      return res.status(404).json({
        message: "Voter account not found",
      });
    }

    if (voter.role !== "voter") {
      return res.status(403).json({
        message: "Only voters can access candidates",
      });
    }

    if (voter.status === "blocked") {
      return res.status(403).json({
        message:
          "Your voter account has been blocked by admin",
      });
    }

    // ==========================================
    // CHECK ALREADY VOTED
    // ==========================================

    const existingVote = await Vote.findOne({
      voter: req.user.userId,
      election: electionId,
    });

    if (existingVote) {
      return res.status(403).json({
        message:
          "You have already voted in this election",
        code: "ALREADY_VOTED",
      });
    }

    // ==========================================
    // GET CANDIDATES
    // ==========================================

    const candidates = await Candidate.find({
      election: electionId,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      message:
        "Candidates fetched successfully",
      election,
      candidates,
    });
  } catch (error) {
    console.error(
      "Get voter candidates error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching candidates",
    });
  }
};

// ==========================================
// SUBMIT VOTE
// ==========================================

const submitVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (!electionId || !candidateId) {
      return res.status(400).json({
        message:
          "Election ID and candidate ID are required",
      });
    }

    // ==========================================
    // GET VOTER
    // ==========================================

    const voter = await User.findById(
      req.user.userId
    );

    if (!voter) {
      return res.status(404).json({
        message: "Voter account not found",
      });
    }

    // ==========================================
    // ROLE CHECK
    // ==========================================

    if (voter.role !== "voter") {
      return res.status(403).json({
        message: "Only voters can submit votes",
      });
    }

    // ==========================================
    // BLOCKED CHECK
    // ==========================================

    if (voter.status === "blocked") {
      return res.status(403).json({
        message:
          "Your voter account has been blocked by admin",
      });
    }

    // ==========================================
    // GET ELECTION
    // ==========================================

    const election = await Election.findById(
      electionId
    );

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    // ==========================================
    // CHECK ELECTION ACTIVE
    // ==========================================

    const now = new Date();

    if (
      election.status !== "active" ||
      election.startDate > now ||
      election.endDate <= now
    ) {
      return res.status(400).json({
        message:
          "Voting is not currently open for this election",
      });
    }

    // ==========================================
    // GET CANDIDATE
    // ==========================================

    const candidate = await Candidate.findById(
      candidateId
    );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    // ==========================================
    // CHECK CANDIDATE BELONGS TO ELECTION
    // ==========================================

    if (
      candidate.election.toString() !==
      electionId.toString()
    ) {
      return res.status(400).json({
        message:
          "Candidate does not belong to this election",
      });
    }

    // ==========================================
    // CHECK ALREADY VOTED
    // ==========================================

    const existingVote = await Vote.findOne({
      voter: req.user.userId,
      election: electionId,
    });

    if (existingVote) {
      return res.status(409).json({
        message:
          "You have already voted in this election",
        code: "ALREADY_VOTED",
      });
    }

    // ==========================================
    // CREATE VOTE
    // ==========================================

    const vote = await Vote.create({
      voter: req.user.userId,
      election: electionId,
      candidate: candidateId,
    });

    // ==========================================
    // UPDATE USER
    // ==========================================

    voter.hasVoted = true;

    await voter.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      message: "Vote submitted successfully",
      vote: {
        id: vote._id,
        election: vote.election,
        candidate: vote.candidate,
        createdAt: vote.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Submit vote error:",
      error
    );

    // Duplicate vote protection
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already voted in this election",
        code: "ALREADY_VOTED",
      });
    }

    return res.status(500).json({
      message:
        "Server error while submitting vote",
    });
  }
};

// ==========================================
// CHECK VOTING STATUS
// ==========================================

const getVotingStatus = async (req, res) => {
  try {
    const { electionId } = req.params;

    const vote = await Vote.findOne({
      voter: req.user.userId,
      election: electionId,
    }).populate(
      "candidate",
      "name candidateId party"
    );

    return res.status(200).json({
      hasVoted: !!vote,
      vote: vote || null,
    });
  } catch (error) {
    console.error(
      "Get voting status error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while checking voting status",
    });
  }
};

const getMyVotingHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user.userId })
      .populate("election", "title startDate endDate status")
      .populate("candidate", "name party position")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Voting history fetched successfully",
      votes: votes.map((vote) => ({
        _id: vote._id,
        election: vote.election,
        candidate: vote.candidate,
        createdAt: vote.createdAt,
        status: vote.election?.status || "unknown",
      })),
    });
  } catch (error) {
    console.error("Get voting history error:", error);
    return res.status(500).json({ message: "Server error while fetching voting history" });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getActiveElections,
  getCandidatesForVoter,
  submitVote,
  getVotingStatus,
  getMyVotingHistory,
};