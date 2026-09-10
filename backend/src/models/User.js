/**
 * @file User.js
 * @description Mongoose model stub for User and Identity profiles.
 * 
 * FUTURE PURPOSE:
 * - Caches on-chain identity registrations and off-chain user profile details.
 * - Stores wallet address, DID identifier, assigned RBAC role, public key, and status.
 * 
 * TARGET PHASE:
 * - Phase 3: Backend — Express + Mongoose models, blockchain event listener/indexer, REST API
 */

const mongoose = require("mongoose");

// TODO [Phase 3]: Implement full schema with indexes and validation
/*
const userSchema = new mongoose.Schema(
  {
    // walletAddress: { type: String, required: true, unique: true, lowercase: true, index: true },
    // did: { type: String, required: true, unique: true, index: true },
    // role: { 
    //   type: String, 
    //   enum: ["ADMIN", "MANAGER", "AUDITOR", "USER"], 
    //   default: "USER" 
    // },
    // name: { type: String, trim: true },
    // email: { type: String, trim: true },
    // organization: { type: String, default: "Bharat Electronics Limited" },
    // publicKey: { type: String },
    // didDocument: { type: Object },
    // isActive: { type: Boolean, default: true },
    // registeredAtBlock: { type: Number },
    // transactionHash: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
*/

// Phase 0 placeholder export
const userSchema = new mongoose.Schema({});
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
