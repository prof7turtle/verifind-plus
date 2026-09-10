/**
 * @file db.js
 * @description Mongoose database connection manager.
 * @notice Establishes connection to MongoDB using process.env.MONGO_URI.
 *         If connection fails, logs error and exits process to prevent running disconnected.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sih26125_platform";

  try {
    await mongoose.connect(mongoUri);
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (error) {
    console.error(`[Database] Connection failed to ${mongoUri}:`, error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
