const Election = require("../models/election");

// ==========================================
// UPDATE ELECTION STATUSES
// ==========================================

const updateElectionStatuses = async () => {
  try {
    const now = new Date();

    // ========================================
    // UPCOMING
    // ========================================

    await Election.updateMany(
      {
        startDate: { $gt: now },
      },
      {
        $set: {
          status: "upcoming",
        },
      }
    );

    // ========================================
    // ACTIVE
    // ========================================

    await Election.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gt: now },
      },
      {
        $set: {
          status: "active",
        },
      }
    );

    // ========================================
    // ENDED
    // ========================================

    await Election.updateMany(
      {
        endDate: { $lte: now },
      },
      {
        $set: {
          status: "ended",
        },
      }
    );
  } catch (error) {
    console.error(
      "Update election statuses error:",
      error
    );
  }
};

// ==========================================
// CREATE ELECTION
// ==========================================

const createElection = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
    } = req.body;

    // Required fields
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Convert dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // Start date cannot be in past
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        message:
          "Start date cannot be in the past",
      });
    }

    // End date must be after start date
    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be after start date",
      });
    }

    // ========================================
    // CREATE ELECTION
    // ========================================

    const election = await Election.create({
      title: title.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      status: "upcoming",
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message:
        "Election created successfully",
      election,
    });
  } catch (error) {
    console.error(
      "Create election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating election",
    });
  }
};

// ==========================================
// GET ALL ELECTIONS
// ==========================================

const getElections = async (req, res) => {
  try {
    // Update statuses before fetching
    await updateElectionStatuses();

    const elections = await Election.find()
      .populate(
        "createdBy",
        "fullName email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message:
        "Elections fetched successfully",
      elections,
    });
  } catch (error) {
    console.error(
      "Get elections error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching elections",
    });
  }
};

// ==========================================
// GET SINGLE ELECTION
// ==========================================

const getElectionById = async (req, res) => {
  try {
    // Update status first
    await updateElectionStatuses();

    const { id } = req.params;

    const election =
      await Election.findById(id).populate(
        "createdBy",
        "fullName email"
      );

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    return res.status(200).json({
      message:
        "Election fetched successfully",
      election,
    });
  } catch (error) {
    console.error(
      "Get election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching election",
    });
  }
};

// ==========================================
// UPDATE ELECTION
// ==========================================

const updateElection = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      startDate,
      endDate,
    } = req.body;

    // ========================================
    // FIND ELECTION
    // ========================================

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // ========================================
    // CONVERT DATES
    // ========================================

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ========================================
    // VALIDATE DATES
    // ========================================

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // ========================================
    // END DATE VALIDATION
    // ========================================

    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be after start date",
      });
    }

    // ========================================
    // UPDATE DATA
    // ========================================

    election.title = title.trim();

    election.description =
      description.trim();

    election.startDate = start;

    election.endDate = end;

    // ========================================
    // UPDATE STATUS
    // ========================================

    const now = new Date();

    if (end <= now) {
      election.status = "ended";
    } else if (
      start <= now &&
      end > now
    ) {
      election.status = "active";
    } else {
      election.status = "upcoming";
    }

    // ========================================
    // SAVE
    // ========================================

    await election.save();

    return res.status(200).json({
      message:
        "Election updated successfully",
      election,
    });
  } catch (error) {
    console.error(
      "Update election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating election",
    });
  }
};

// ==========================================
// DELETE ELECTION
// ==========================================

const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    await Election.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Election deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete election error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting election",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  updateElectionStatuses,
};