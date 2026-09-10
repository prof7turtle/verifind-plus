/**
 * @file identity.routes.js
 * @description Routes for Identity cache queries.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const express = require("express");
const router = express.Router();
const { listUsers, getUserByAddress } = require("../controllers/identityController");

router.get("/", listUsers);
router.get("/:address", getUserByAddress);

module.exports = router;
