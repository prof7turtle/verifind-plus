/**
 * @file server.js
 * @description Main entry point for the Express backend service.
 * 
 * FUTURE PURPOSE:
 * - Bootstraps Express server with security and logging middlewares (cors, express.json, morgan).
 * - Connects to MongoDB via Mongoose.
 * - Initializes the blockchain event listener service (ethers.js) to sync on-chain events.
 * - Mounts REST API routes for identities, assets, RBAC checks, and audit trail retrieval.
 * 
 * TARGET PHASE:
 * - Phase 3: Backend — Express + Mongoose models, blockchain event listener/indexer, REST API
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "sih26125-backend",
    phase: "Phase 0 (Scaffold)",
    timestamp: new Date().toISOString(),
  });
});

// TODO [Phase 3]: Mount routes
// app.use("/api/identity", identityRoutes);
// app.use("/api/assets", assetRoutes);
// app.use("/api/audit", auditRoutes);

async function startServer() {
  try {
    // Connect to database placeholder
    await connectDB();

    // TODO [Phase 3]: Start blockchain event listener service
    // const { startBlockchainListener } = require("./services/blockchainListener");
    // startBlockchainListener();

    app.listen(PORT, () => {
      console.log(`[Phase 0 Skeleton] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Allow importing app for testing without automatically listening if needed
if (require.main === module) {
  startServer();
}

module.exports = app;
