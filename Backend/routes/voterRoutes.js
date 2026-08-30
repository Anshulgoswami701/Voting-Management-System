const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  getVoters,
  getVoterById,
  updateVoter,
  updateVoterStatus,
  deleteVoter,
} = require("../controllers/voterController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const voterMiddleware = require("../middleware/voterMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, voterMiddleware, getMyProfile);
router.put("/me", authMiddleware, voterMiddleware, updateMyProfile);

router.get("/", authMiddleware, adminMiddleware, getVoters);
router.get("/:id", authMiddleware, adminMiddleware, getVoterById);
router.put("/:id", authMiddleware, adminMiddleware, updateVoter);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateVoterStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteVoter);

module.exports = router;