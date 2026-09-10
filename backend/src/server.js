/**
 * @file server.js
 * @description Main entry point for the Express backend service.
 * @notice REST API server and blockchain event indexer for VeriFind Plus (SIH 26125).
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const { startListening, getListenerStatus } = require("./services/blockchainListener");

const identityRoutes = require("./routes/identity.routes");
const assetRoutes = require("./routes/asset.routes");
const auditRoutes = require("./routes/audit.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const listenerStatus = getListenerStatus();

  res.status(200).json({
    status: isDbConnected ? "ok" : "degraded",
    service: "sih26125-backend",
    phase: "Phase 3 (Backend & Indexer)",
    database: {
      connected: isDbConnected,
      readyState: mongoose.connection.readyState,
    },
    blockchainListener: listenerStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/identity", identityRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/audit", auditRoutes);

// Catch-all 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start Blockchain Indexer / Listener
    await startListening();

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      console.log(`[Server] Express running on port ${PORT} (http://localhost:${PORT})`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("[Server] Fatal error on startup:", error.message);
    process.exit(1);
  }
}

// Allow importing app for testing without starting the server
if (require.main === module) {
  startServer();
}

module.exports = app;
