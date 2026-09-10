/**
 * @file AuditLog.js
 * @description Mongoose model stub for immutable on-chain audit log index.
 * 
 * FUTURE PURPOSE:
 * - Stores structured, queryable records of all events emitted by smart contracts.
 * - Records identity registrations, role updates, asset minting, transfers, and revocations.
 * - Enables auditors to filter actions by user, date, event type, and verify against tx hash.
 * 
 * TARGET PHASE:
 * - Phase 3: Backend — Express + Mongoose models, blockchain event listener/indexer, REST API
 */

const mongoose = require("mongoose");

// TODO [Phase 3]: Implement full schema with indexes and validation
/*
const auditLogSchema = new mongoose.Schema(
  {
    // eventType: { 
    //   type: String, 
    //   required: true, 
    //   enum: [
    //     "IDENTITY_REGISTERED", 
    //     "ROLE_GRANTED", 
    //     "ROLE_REVOKED", 
    //     "IDENTITY_DEACTIVATED", 
    //     "ASSET_MINTED", 
    //     "ASSET_TRANSFERRED", 
    //     "ASSET_DECOMMISSIONED"
    //   ],
    //   index: true 
    // },
    // contractAddress: { type: String, required: true, lowercase: true },
    // transactionHash: { type: String, required: true, index: true },
    // blockNumber: { type: Number, required: true, index: true },
    // performerAddress: { type: String, lowercase: true, index: true },
    // targetAddress: { type: String, lowercase: true },
    // tokenId: { type: String },
    // payload: { type: mongoose.Schema.Types.Mixed },
    // timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
*/

// Phase 0 placeholder export
const auditLogSchema = new mongoose.Schema({});
module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
