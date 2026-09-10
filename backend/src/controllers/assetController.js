/**
 * @file assetController.js
 * @description Controller for digital asset queries.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const Asset = require("../models/Asset");

/**
 * @desc Get all assets (paginated, filterable by owner, excludes decommissioned by default)
 * @route GET /api/assets
 */
async function listAssets(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.includeDecommissioned !== "true") {
      filter.isDecommissioned = false;
    }

    if (req.query.owner) {
      filter.ownerAddress = req.query.owner.toLowerCase();
    }

    const total = await Asset.countDocuments(filter);
    const assets = await Asset.find(filter)
      .sort({ tokenId: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Get single asset by tokenId
 * @route GET /api/assets/:tokenId
 */
async function getAssetById(req, res) {
  try {
    const tokenId = parseInt(req.params.tokenId, 10);
    if (isNaN(tokenId)) {
      return res.status(400).json({ success: false, message: "Invalid tokenId" });
    }

    const asset = await Asset.findOne({ tokenId });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset with tokenId ${tokenId} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listAssets,
  getAssetById,
};
