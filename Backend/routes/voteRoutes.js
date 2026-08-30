const express = require("express");

const {
  getActiveElections,
  getCandidatesForVoter,
  submitVote,
  getVotingStatus,
  getMyVotingHistory,
} = require("../controllers/voteController");

const authMiddleware = require("../middleware/authMiddleware");
const voterMiddleware = require("../middleware/voterMiddleware");

const router = express.Router();

router.get("/active", authMiddleware, voterMiddleware, getActiveElections);
router.get("/history", authMiddleware, voterMiddleware, getMyVotingHistory);
router.get("/election/:electionId/candidates", authMiddleware, voterMiddleware, getCandidatesForVoter);
router.get("/election/:electionId/status", authMiddleware, voterMiddleware, getVotingStatus);
router.post("/", authMiddleware, voterMiddleware, submitVote);

module.exports = router;