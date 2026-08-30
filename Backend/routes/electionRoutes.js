const express = require("express");

const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  getActiveElectionsForVoter,
  getVoterElectionById,
} = require("../controllers/electionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ======================================================
// ADMIN ROUTES
// ======================================================

// CREATE ELECTION
// ADMIN ONLY
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createElection
);

// GET ALL ELECTIONS
// ADMIN ONLY
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getElections
);

// ======================================================
// VOTER ROUTES
// IMPORTANT:
// These routes MUST come before /:id
// ======================================================

// GET ACTIVE ELECTIONS
// VOTER ONLY
router.get(
  "/voter/active",
  authMiddleware,
  getActiveElectionsForVoter
);

// GET SINGLE ELECTION + CANDIDATES
// VOTER ONLY
router.get(
  "/voter/:id",
  authMiddleware,
  getVoterElectionById
);

// ======================================================
// ADMIN SINGLE ELECTION ROUTES
// ======================================================

// GET SINGLE ELECTION
// ADMIN ONLY
router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getElectionById
);

// UPDATE ELECTION
// ADMIN ONLY
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateElection
);

// DELETE ELECTION
// ADMIN ONLY
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteElection
);

module.exports = router;