const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    candidateId: {
      type: String,
      required: true,
      trim: true,
    },

    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    position: {
      type: String,
      trim: true,
      default: "",
    },

    party: {
      type: String,
      trim: true,
      default: "",
    },

    manifesto: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    photo: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

candidateSchema.index(
  { candidateId: 1, election: 1 },
  { unique: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);