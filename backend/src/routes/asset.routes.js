/**
 * @file asset.routes.js
 * @description Routes for Asset queries.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const express = require("express");
const router = express.Router();
const { listAssets, getAssetById } = require("../controllers/assetController");

router.get("/", listAssets);
router.get("/:tokenId", getAssetById);

module.exports = router;
