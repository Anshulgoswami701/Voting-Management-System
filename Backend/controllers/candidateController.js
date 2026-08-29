const Candidate = require("../models/candidate");
const Election = require("../models/election");

// ==========================================
// CREATE CANDIDATE
// ADMIN ONLY
// ==========================================

const createCandidate = async (req, res) => {
  try {
    const {
      name,
      candidateId,
      election,
      party,
      description,
      photo,
    } = req.body;

    // ==========================================
    // 1. REQUIRED FIELDS
    // ==========================================

    if (!name || !candidateId || !election || !party) {
      return res.status(400).json({
        message:
          "Name, candidate ID, election and party are required",
      });
    }

    // ==========================================
    // 2. CHECK ELECTION
    // ==========================================

    const existingElection = await Election.findById(
      election
    );

    if (!existingElection) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    // ==========================================
    // 3. CHECK ELECTION STATUS
    // ==========================================

    if (existingElection.status === "ended") {
      return res.status(400).json({
        message:
          "Cannot add candidate to an ended election",
      });
    }

    // ==========================================
    // 4. CHECK DUPLICATE CANDIDATE
    // ==========================================

    const existingCandidate = await Candidate.findOne({
      candidateId,
      election,
    });

    if (existingCandidate) {
      return res.status(409).json({
        message:
          "Candidate ID already exists in this election",
      });
    }

    // ==========================================
    // 5. CREATE CANDIDATE
    // ==========================================

    const candidate = await Candidate.create({
      name,
      candidateId,
      election,
      party,
      description: description || "",
      photo: photo || "",
    });

    return res.status(201).json({
      message: "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    console.error(
      "Create candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating candidate",
    });
  }
};

// ==========================================
// GET ALL CANDIDATES
// ADMIN ONLY
// ==========================================

const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate(
        "election",
        "title startDate endDate status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Candidates fetched successfully",
      candidates,
    });
  } catch (error) {
    console.error(
      "Get candidates error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching candidates",
    });
  }
};

// ==========================================
// GET CANDIDATES BY ELECTION
// ADMIN ONLY
// ==========================================

const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Check election exists
    const existingElection = await Election.findById(
      electionId
    );

    if (!existingElection) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    const candidates = await Candidate.find({
      election: electionId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message:
        "Election candidates fetched successfully",
      election: existingElection,
      candidates,
    });
  } catch (error) {
    console.error(
      "Get election candidates error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching election candidates",
    });
  }
};

// ==========================================
// GET SINGLE CANDIDATE
// ADMIN ONLY
// ==========================================

const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id).populate(
      "election",
      "title startDate endDate status"
    );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      message: "Candidate fetched successfully",
      candidate,
    });
  } catch (error) {
    console.error(
      "Get candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching candidate",
    });
  }
};

// ==========================================
// UPDATE CANDIDATE
// ADMIN ONLY
// ==========================================

const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      candidateId,
      party,
      description,
      photo,
    } = req.body;

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    // ==========================================
    // CHECK DUPLICATE CANDIDATE ID
    // ==========================================

    if (candidateId && candidateId !== candidate.candidateId) {
      const duplicateCandidate =
        await Candidate.findOne({
          candidateId,
          election: candidate.election,
          _id: { $ne: id },
        });

      if (duplicateCandidate) {
        return res.status(409).json({
          message:
            "Candidate ID already exists in this election",
        });
      }
    }

    // ==========================================
    // UPDATE FIELDS
    // ==========================================

    if (name !== undefined) {
      candidate.name = name;
    }

    if (candidateId !== undefined) {
      candidate.candidateId = candidateId;
    }

    if (party !== undefined) {
      candidate.party = party;
    }

    if (description !== undefined) {
      candidate.description = description;
    }

    if (photo !== undefined) {
      candidate.photo = photo;
    }

    await candidate.save();

    return res.status(200).json({
      message: "Candidate updated successfully",
      candidate,
    });
  } catch (error) {
    console.error(
      "Update candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating candidate",
    });
  }
};

// ==========================================
// DELETE CANDIDATE
// ADMIN ONLY
// ==========================================

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    await Candidate.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete candidate error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting candidate",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createCandidate,
  getCandidates,
  getCandidatesByElection,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
};