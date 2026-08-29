const express = require("express");

const {
  createCandidate,
  getCandidates,
  getCandidatesByElection,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// CREATE CANDIDATE
// ADMIN ONLY
// ==========================================

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createCandidate
);

// ==========================================
// GET ALL CANDIDATES
// ADMIN ONLY
// ==========================================

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getCandidates
);

// ==========================================
// GET CANDIDATES BY ELECTION
// ADMIN ONLY
// ==========================================

router.get(
  "/election/:electionId",
  authMiddleware,
  adminMiddleware,
  getCandidatesByElection
);

// ==========================================
// GET SINGLE CANDIDATE
// ADMIN ONLY
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getCandidateById
);

// ==========================================
// UPDATE CANDIDATE
// ADMIN ONLY
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCandidate
);

// ==========================================
// DELETE CANDIDATE
// ADMIN ONLY
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteCandidate
);

module.exports = router;