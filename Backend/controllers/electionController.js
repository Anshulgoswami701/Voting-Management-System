const Election = require("../models/election");

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

    // 1. Required fields
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // 2. Convert dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 3. Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // 4. End date must be after start date
    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // 5. Create election
    const election = await Election.create({
      title,
      description,
      startDate: start,
      endDate: end,
      status: "upcoming",
      createdBy: req.user.userId,
    });

    // 6. Response
    return res.status(201).json({
      message: "Election created successfully",
      election,
    });

  } catch (error) {
    console.error("Create election error:", error);

    return res.status(500).json({
      message: "Server error while creating election",
    });
  }
};


// ==========================================
// GET ALL ELECTIONS
// ==========================================

const getElections = async (req, res) => {
  try {

    const elections = await Election.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Elections fetched successfully",
      elections,
    });

  } catch (error) {
    console.error("Get elections error:", error);

    return res.status(500).json({
      message: "Server error while fetching elections",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createElection,
  getElections,
};