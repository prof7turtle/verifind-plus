/**
 * @file audit.routes.js
 * @description Routes for AuditLog queries.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const express = require("express");
const router = express.Router();
const { listAuditLogs, getAuditByAddress } = require("../controllers/auditController");

router.get("/", listAuditLogs);
router.get("/:address", getAuditByAddress);

module.exports = router;
