const express = require("express");

const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  getActiveElectionsForVoter,
  getVoterElectionById,
  getVoterElections,
} = require("../controllers/electionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const voterMiddleware = require("../middleware/voterMiddleware");

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createElection);
router.get("/", authMiddleware, adminMiddleware, getElections);

router.get("/voter/active", authMiddleware, voterMiddleware, getActiveElectionsForVoter);
router.get("/voter/list", authMiddleware, voterMiddleware, getVoterElections);
router.get("/voter/:id", authMiddleware, voterMiddleware, getVoterElectionById);

router.get("/:id", authMiddleware, adminMiddleware, getElectionById);
router.put("/:id", authMiddleware, adminMiddleware, updateElection);
router.delete("/:id", authMiddleware, adminMiddleware, deleteElection);

module.exports = router;