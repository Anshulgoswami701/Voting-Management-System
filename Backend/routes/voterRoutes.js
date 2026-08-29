const express = require("express");

const {
  getVoters,
  getVoterById,
  updateVoter,
  updateVoterStatus,
  deleteVoter,
} = require("../controllers/voterController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// GET ALL VOTERS
// ==========================================

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getVoters
);

// ==========================================
// GET SINGLE VOTER
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getVoterById
);

// ==========================================
// UPDATE VOTER
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateVoter
);

// ==========================================
// BLOCK / UNBLOCK VOTER
// ==========================================

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateVoterStatus
);

// ==========================================
// DELETE VOTER
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteVoter
);

module.exports = router;