const express = require("express");

const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
   deleteElection
} = require("../controllers/electionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// CREATE ELECTION
// ADMIN ONLY
// ==========================================

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createElection
);

// ==========================================
// GET ALL ELECTIONS
// ADMIN ONLY
// ==========================================

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getElections
);

// ==========================================
// GET SINGLE ELECTION
// ADMIN ONLY
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getElectionById
);

// ==========================================
// UPDATE ELECTION
// ADMIN ONLY
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateElection
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteElection
);
module.exports = router;