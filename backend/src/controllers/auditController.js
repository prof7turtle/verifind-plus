/**
 * @file auditController.js
 * @description Controller for querying immutable audit log entries.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const AuditLog = require("../models/AuditLog");

/**
 * @desc Get all audit logs (paginated, sorted descending by timestamp)
 * @route GET /api/audit
 */
async function listAuditLogs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.eventType) {
      filter.eventType = req.query.eventType;
    }
    if (req.query.contractName) {
      filter.contractName = req.query.contractName;
    }
    if (req.query.txHash) {
      filter.transactionHash = req.query.txHash;
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1, blockNumber: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Get audit logs relating to a specific Ethereum address
 * @route GET /api/audit/:address
 */
async function getAuditByAddress(req, res) {
  try {
    const address = req.params.address.toLowerCase();

    // Search across all possible address attributes in args
    const filter = {
      $or: [
        { "args.user": address },
        { "args.owner": address },
        { "args.from": address },
        { "args.to": address },
        { "args.grantedBy": address },
        { "args.decommissionedBy": address },
        { "args.mintedBy": address },
      ],
    };

    const logs = await AuditLog.find(filter).sort({ timestamp: -1, blockNumber: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      address,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listAuditLogs,
  getAuditByAddress,
};
