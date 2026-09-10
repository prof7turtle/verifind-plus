/**
 * @file Asset.js
 * @description Mongoose model for Digital Assets indexed from AssetNFT.sol.
 * @notice Caches token details, current owner, metadata hash, and decommissioning status.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    tokenId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    ownerAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    metadataHash: {
      type: String,
      required: true,
      trim: true,
    },
    mintedBy: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mintedAt: {
      type: Date,
      default: Date.now,
    },
    isDecommissioned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Asset || mongoose.model("Asset", assetSchema);
