/**
 * @file Asset.js
 * @description Mongoose model stub for digital assets synced from AssetNFT contract.
 * 
 * FUTURE PURPOSE:
 * - Maintains cache of on-chain ERC-721 token metadata and ownership history.
 * - Stores off-chain rich metadata (title, category, technical specs, IPFS hash, file attachments).
 * - Tracks current owner address and lifecycle status (Active, Transferred, Decommissioned).
 * 
 * TARGET PHASE:
 * - Phase 3: Backend — Express + Mongoose models, blockchain event listener/indexer, REST API
 */

const mongoose = require("mongoose");

// TODO [Phase 3]: Implement full schema with indexes and validation
/*
const assetSchema = new mongoose.Schema(
  {
    // tokenId: { type: Number, required: true, unique: true, index: true },
    // name: { type: String, required: true, trim: true },
    // description: { type: String },
    // category: { type: String, default: "General Asset" },
    // ipfsHash: { type: String, required: true },
    // tokenURI: { type: String },
    // currentOwner: { type: String, required: true, lowercase: true, index: true },
    // creator: { type: String, required: true, lowercase: true },
    // isDecommissioned: { type: Boolean, default: false },
    // mintTransactionHash: { type: String },
    // metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
*/

// Phase 0 placeholder export
const assetSchema = new mongoose.Schema({});
module.exports = mongoose.models.Asset || mongoose.model("Asset", assetSchema);
