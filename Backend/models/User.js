const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    voterId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["voter", "admin"],
      default: "voter",
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    accountStatus: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    hasVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (this.role === "admin") {
    this.verificationStatus = "verified";
    this.accountStatus = "active";
    this.status = "active";
  }

  if (this.accountStatus && !this.status) {
    this.status = this.accountStatus;
  }

  if (this.status && !this.accountStatus) {
    this.accountStatus = this.status;
  }

  if (this.status !== this.accountStatus) {
    this.accountStatus = this.status;
  }
});

module.exports = mongoose.model("User", userSchema);