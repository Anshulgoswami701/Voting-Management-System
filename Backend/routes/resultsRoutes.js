const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Election = require("../models/election");
const Candidate = require("../models/candidate");
const Vote = require("../models/vote");

const router = express.Router();

const calculateResults = async (electionId) => {
  const election = await Election.findById(electionId);
  if (!election) return null;

  const candidates = await Candidate.find({ election: electionId }).lean();
  const voteRows = await Vote.aggregate([
    { $match: { election: election._id } },
    { $group: { _id: "$candidate", count: { $sum: 1 } } },
  ]);

  const candidateMap = new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));
  const voteCountMap = new Map(voteRows.map((row) => [row._id.toString(), row.count]));

  const results = candidates.map((candidate) => {
    const votes = voteCountMap.get(candidate._id.toString()) || 0;
    return {
      candidateId: candidate._id,
      name: candidate.name,
      position: candidate.position || "",
      party: candidate.party || "",
      votes,
      percentage: election && election._id ? (votes === 0 ? 0 : Number(((votes / Math.max(1, voteRows.reduce((sum, row) => sum + row.count, 0))) * 100).toFixed(2))) : 0,
    };
  });

  const totalVotes = results.reduce((sum, item) => sum + item.votes, 0);
  const winner = results.length > 0 ? [...results].sort((a, b) => b.votes - a.votes)[0] : null;

  return {
    election: {
      _id: election._id,
      title: election.title,
      status: election.status,
      resultsPublished: election.resultsPublished || false,
    },
    totalVotes,
    results,
    winner,
  };
};

router.get("/:electionId", authMiddleware, async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).lean();

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (req.user.role === "admin") {
      const result = await calculateResults(electionId);
      return res.status(200).json({ result });
    }

    if (election.status !== "results_published" && !election.resultsPublished) {
      return res.status(403).json({ message: "Results have not been published yet." });
    }

    const result = await calculateResults(electionId);
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Get results error:", error);
    return res.status(500).json({ message: "Unable to fetch election results" });
  }
});

router.patch("/:electionId/publish", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (election.status !== "ended") {
      return res.status(400).json({ message: "Results can only be published after the election ends." });
    }

    election.status = "results_published";
    election.resultsPublished = true;
    await election.save();

    return res.status(200).json({
      message: "Results published successfully",
      election,
    });
  } catch (error) {
    console.error("Publish results error:", error);
    return res.status(500).json({ message: "Unable to publish results" });
  }
});

module.exports = router;
