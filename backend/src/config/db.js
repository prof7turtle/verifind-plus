/**
 * @file db.js
 * @description Mongoose database connection manager.
 * 
 * FUTURE PURPOSE:
 * - Establishes resilient connection to MongoDB database.
 * - Handles connection pooling, error logging, and graceful disconnects.
 * 
 * TARGET PHASE:
 * - Phase 3: Backend — Express + Mongoose models, blockchain event listener/indexer, REST API
 */

const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sih26125_platform";

  // In Phase 0, we provide a placeholder stub that doesn't crash if MongoDB is not currently running
  try {
    if (process.env.NODE_ENV === "test") return;
    
    // TODO [Phase 3]: Uncomment active connection once MongoDB is provisioned
    // await mongoose.connect(mongoUri);
    // console.log(`[Database] Connected to MongoDB at ${mongoUri}`);

    console.log(`[Phase 0 Skeleton] DB config initialized for ${mongoUri} (connection deferred to Phase 3)`);
  } catch (error) {
    console.error("[Database] Connection failed:", error.message);
    // Graceful handling during initial setup
  }
}

module.exports = { connectDB };
