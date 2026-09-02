const mongoose = require("mongoose");
const crypto = require("crypto");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      set: (value) => (value ? String(value).trim().toUpperCase() : value),
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
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

    termsAccepted: {
      type: Boolean,
      default: false,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    faceEmbedding: {
      type: [Number],
      default: null,
      select: false,
    },

    resetTokenHash: {
      type: String,
      default: null,
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },

    resetTokenUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ voterId: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });

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

userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  this.resetTokenUsedAt = null;
  return rawToken;
};

userSchema.methods.clearPasswordResetToken = function () {
  this.resetTokenHash = null;
  this.resetTokenExpiresAt = null;
  this.resetTokenUsedAt = new Date();
};

module.exports = mongoose.model("User", userSchema);