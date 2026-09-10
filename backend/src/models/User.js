/**
 * @file User.js
 * @description Mongoose model for User identity profiles.
 * @notice Read-optimized CACHE of on-chain identity state indexed from IdentityRegistry.sol.
 *         The smart contract remains the ultimate source of truth.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    did: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "MANAGER", "AUDITOR", "USER"],
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
