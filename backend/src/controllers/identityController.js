/**
 * @file identityController.js
 * @description Controller for identity read/cache endpoints.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const User = require("../models/User");

/**
 * @desc Get all registered users (paginated, filterable by role)
 * @route GET /api/identity
 */
async function listUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role.toUpperCase();
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Get single user by Ethereum address
 * @route GET /api/identity/:address
 */
async function getUserByAddress(req, res) {
  try {
    const address = req.params.address.toLowerCase();
    const user = await User.findOne({ address });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Identity not found for address ${address}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listUsers,
  getUserByAddress,
};
