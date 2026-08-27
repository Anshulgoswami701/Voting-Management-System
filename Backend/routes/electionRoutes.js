const express = require("express");

const {
  createElection,
  getElections,
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

module.exports = router;