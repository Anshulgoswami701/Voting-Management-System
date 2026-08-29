const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    // Candidate name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Candidate ID
    candidateId: {
      type: String,
      required: true,
      trim: true,
    },

    // Candidate belongs to which election
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    // Party / Group name
    party: {
      type: String,
      required: true,
      trim: true,
    },

    // Candidate description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Candidate photo (later we can connect image upload)
    photo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Same candidate ID can exist in different elections,
// but not twice in the same election.
candidateSchema.index(
  { candidateId: 1, election: 1 },
  { unique: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);