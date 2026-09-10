/**
 * @file AuditLog.js
 * @description Mongoose model for the immutable, append-only blockchain event audit log.
 * @notice Stores every state change emitted by IdentityRegistry and AssetNFT.
 *         Documents in this collection must NEVER be updated or deleted.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        "IdentityRegistered",
        "IdentityDeactivated",
        "RoleGrantedAudit",
        "AssetMinted",
        "AssetTransferredWithAudit",
        "AssetDecommissioned",
      ],
      index: true,
    },
    contractName: {
      type: String,
      required: true,
      enum: ["IdentityRegistry", "AssetNFT"],
      index: true,
    },
    transactionHash: {
      type: String,
      required: true,
      index: true,
    },
    blockNumber: {
      type: Number,
      required: true,
      index: true,
    },
    args: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only; no updatedAt
  }
);

// Prevent accidental updates/deletions on the Mongoose model level
auditLogSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
  throw new Error("AuditLog documents are immutable and cannot be updated.");
});

auditLogSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
  throw new Error("AuditLog documents are immutable and cannot be deleted.");
});

module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
