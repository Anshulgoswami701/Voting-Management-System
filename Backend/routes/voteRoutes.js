const express = require("express");

const {
  getActiveElections,
  getCandidatesForVoter,
  submitVote,
  getVotingStatus,
} = require("../controllers/voteController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET ACTIVE ELECTIONS
// AUTHENTICATED USERS
// ==========================================

router.get(
  "/active",
  authMiddleware,
  getActiveElections
);

// ==========================================
// GET CANDIDATES FOR ELECTION
// VOTER
// ==========================================

router.get(
  "/election/:electionId/candidates",
  authMiddleware,
  getCandidatesForVoter
);

// ==========================================
// CHECK VOTING STATUS
// ==========================================

router.get(
  "/election/:electionId/status",
  authMiddleware,
  getVotingStatus
);

// ==========================================
// SUBMIT VOTE
// ==========================================

router.post(
  "/",
  authMiddleware,
  submitVote
);

module.exports = router;