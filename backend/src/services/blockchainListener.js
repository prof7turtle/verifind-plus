/**
 * @file blockchainListener.js
 * @description Blockchain event indexing service for VeriFind Plus (SIH 26125).
 * @notice Subscribes to IdentityRegistry and AssetNFT on-chain events via ethers.js,
 *         writes immutable AuditLog records, and updates read-optimized User and Asset caches.
 * @phase Phase 3 (Backend & Blockchain Event Indexer)
 */

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const User = require("../models/User");
const Asset = require("../models/Asset");
const AuditLog = require("../models/AuditLog");

// Precomputed role hashes matching smart contracts
const ROLE_MAP = {
  [ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"))]: "ADMIN",
  [ethers.keccak256(ethers.toUtf8Bytes("MANAGER_ROLE"))]: "MANAGER",
  [ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"))]: "AUDITOR",
  [ethers.keccak256(ethers.toUtf8Bytes("USER_ROLE"))]: "USER",
};

function formatRole(roleHash) {
  if (!roleHash) return "USER";
  const mapped = ROLE_MAP[roleHash.toLowerCase()];
  if (mapped) return mapped;
  // Fallback if role is already a string
  if (typeof roleHash === "string" && ["ADMIN", "MANAGER", "AUDITOR", "USER"].includes(roleHash.toUpperCase())) {
    return roleHash.toUpperCase();
  }
  return "USER";
}

let listenerState = {
  isListening: false,
  rpcUrl: null,
  identityRegistryAddress: null,
  assetNFTAddress: null,
  lastIndexedBlock: 0,
  error: null,
};

/**
 * Loads contract artifacts and addresses from contracts directory.
 */
function loadContractConfigs() {
  const rootDir = path.resolve(__dirname, "../../../");
  const deployedAddressesPath = path.join(rootDir, "contracts/deployed-addresses.json");
  const identityArtifactPath = path.join(
    rootDir,
    "contracts/artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json"
  );
  const assetArtifactPath = path.join(
    rootDir,
    "contracts/artifacts/contracts/AssetNFT.sol/AssetNFT.json"
  );

  if (!fs.existsSync(deployedAddressesPath)) {
    throw new Error(`Deployed addresses file not found at ${deployedAddressesPath}`);
  }
  if (!fs.existsSync(identityArtifactPath)) {
    throw new Error(`IdentityRegistry artifact not found at ${identityArtifactPath}`);
  }
  if (!fs.existsSync(assetArtifactPath)) {
    throw new Error(`AssetNFT artifact not found at ${assetArtifactPath}`);
  }

  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
  const identityArtifact = JSON.parse(fs.readFileSync(identityArtifactPath, "utf8"));
  const assetArtifact = JSON.parse(fs.readFileSync(assetArtifactPath, "utf8"));

  return {
    identityRegistryAddress: deployedAddresses.identityRegistry,
    assetNFTAddress: deployedAddresses.assetNFT,
    identityAbi: identityArtifact.abi,
    assetAbi: assetArtifact.abi,
  };
}

function getTxAndBlock(event) {
  const txHash =
    event?.log?.transactionHash ||
    event?.transactionHash ||
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const blockNum = Number(event?.log?.blockNumber ?? event?.blockNumber ?? 0);
  return { txHash, blockNum };
}

/**
 * Handles IdentityRegistered event.
 */
async function handleIdentityRegistered(user, did, role, timestamp, event) {
  try {
    const userAddress = user.toLowerCase();
    const roleName = formatRole(role);
    const eventTime = new Date(Number(timestamp) * 1000);
    const { txHash, blockNum } = getTxAndBlock(event);

    // Check duplicate audit log
    const existingLog = await AuditLog.findOne({
      transactionHash: txHash,
      eventType: "IdentityRegistered",
    });

    if (!existingLog) {
      await AuditLog.create({
        eventType: "IdentityRegistered",
        contractName: "IdentityRegistry",
        transactionHash: txHash,
        blockNumber: blockNum,
        args: { user: userAddress, did, role: roleName, timestamp: Number(timestamp) },
        timestamp: eventTime,
      });
    }

    // Upsert User Cache
    await User.findOneAndUpdate(
      { address: userAddress },
      {
        address: userAddress,
        did,
        role: roleName,
        isActive: true,
        registeredAt: eventTime,
        lastUpdatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`[Indexer] IdentityRegistered: user=${userAddress} did=${did} role=${roleName}`);
  } catch (err) {
    console.error("[Indexer] Error processing IdentityRegistered:", err.message);
  }
}

/**
 * Handles IdentityDeactivated event.
 */
async function handleIdentityDeactivated(user, timestamp, event) {
  try {
    const userAddress = user.toLowerCase();
    const eventTime = new Date(Number(timestamp) * 1000);
    const { txHash, blockNum } = getTxAndBlock(event);

    const existingLog = await AuditLog.findOne({
      transactionHash: txHash,
      eventType: "IdentityDeactivated",
    });

    if (!existingLog) {
      await AuditLog.create({
        eventType: "IdentityDeactivated",
        contractName: "IdentityRegistry",
        transactionHash: txHash,
        blockNumber: blockNum,
        args: { user: userAddress, timestamp: Number(timestamp) },
        timestamp: eventTime,
      });
    }

    // Update User Cache
    await User.findOneAndUpdate(
      { address: userAddress },
      { isActive: false, lastUpdatedAt: new Date() }
    );

    console.log(`[Indexer] IdentityDeactivated: user=${userAddress}`);
  } catch (err) {
    console.error("[Indexer] Error processing IdentityDeactivated:", err.message);
  }
}

/**
 * Handles RoleGrantedAudit event.
 */
async function handleRoleGrantedAudit(user, role, grantedBy, timestamp, event) {
  try {
    const userAddress = user.toLowerCase();
    const granterAddress = grantedBy.toLowerCase();
    const roleName = formatRole(role);
    const eventTime = new Date(Number(timestamp) * 1000);
    const { txHash, blockNum } = getTxAndBlock(event);

    const existingLog = await AuditLog.findOne({
      transactionHash: txHash,
      eventType: "RoleGrantedAudit",
    });

    if (!existingLog) {
      await AuditLog.create({
        eventType: "RoleGrantedAudit",
        contractName: "IdentityRegistry",
        transactionHash: txHash,
        blockNumber: blockNum,
        args: {
          user: userAddress,
          role: roleName,
          grantedBy: granterAddress,
          timestamp: Number(timestamp),
        },
        timestamp: eventTime,
      });
    }

    // Update User Cache
    await User.findOneAndUpdate(
      { address: userAddress },
      { role: roleName, lastUpdatedAt: new Date() }
    );

    console.log(`[Indexer] RoleGrantedAudit: user=${userAddress} newRole=${roleName} grantedBy=${granterAddress}`);
  } catch (err) {
    console.error("[Indexer] Error processing RoleGrantedAudit:", err.message);
  }
}

/**
 * Handles AssetMinted event.
 */
async function handleAssetMinted(tokenId, owner, metadataHash, mintedBy, timestamp, event) {
  try {
    const id = Number(tokenId);
    const ownerAddress = owner.toLowerCase();
    const minterAddress = mintedBy.toLowerCase();
    const eventTime = new Date(Number(timestamp) * 1000);
    const { txHash, blockNum } = getTxAndBlock(event);

    const existingLog = await AuditLog.findOne({
      transactionHash: txHash,
      eventType: "AssetMinted",
    });

    if (!existingLog) {
      await AuditLog.create({
        eventType: "AssetMinted",
        contractName: "AssetNFT",
        transactionHash: txHash,
        blockNumber: blockNum,
        args: {
          tokenId: id,
          owner: ownerAddress,
          metadataHash,
          mintedBy: minterAddress,
          timestamp: Number(timestamp),
        },
        timestamp: eventTime,
      });
    }

    // Upsert Asset Cache: use $setOnInsert for initial state so subsequent transfers aren't overwritten
    await Asset.findOneAndUpdate(
      { tokenId: id },
      {
        $setOnInsert: {
          tokenId: id,
          ownerAddress,
          metadataHash,
          mintedBy: minterAddress,
          mintedAt: eventTime,
          isDecommissioned: false,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[Indexer] AssetMinted: tokenId=${id} owner=${ownerAddress} metadataHash=${metadataHash}`);
  } catch (err) {
    console.error("[Indexer] Error processing AssetMinted:", err.message);
  }
}

/**
 * Handles AssetTransferredWithAudit event.
 */
async function handleAssetTransferredWithAudit(tokenId, from, to, timestamp, event) {
  try {
    const id = Number(tokenId);
    const fromAddress = from.toLowerCase();
    const toAddress = to.toLowerCase();
    const eventTime = new Date(Number(timestamp) * 1000);
    const { txHash, blockNum } = getTxAndBlock(event);

    const existingLog = await AuditLog.findOne({
      transactionHash: txHash,
      eventType: "AssetTransferredWithAudit",
    });

    if (!existingLog) {
      await AuditLog.create({
        eventType: "AssetTransferredWithAudit",
        contractName: "AssetNFT",
        transactionHash: txHash,
        blockNumber: blockNum,
        args: {
          tokenId: id,
          from: fromAddress,
          to: toAddress,
          timestamp: Number(timestamp),
        },
        timestamp: eventTime,
      });
    }

    // Update Asset owner
    await Asset.findOneAndUpdate(
      { tokenId: id },
      { ownerAddress: toAddress }
    );

    console.log(`[Indexer] AssetTransferredWithAudit: tokenId=${id} from=${fromAddress} to=${toAddress}`);
  } catch (err) {
    console.error("[Indexer] Error processing AssetTransferredWithAudit:", err.message);
  }
}

/**
 * Handles AssetDecommissioned event.
 */
async function handleAssetDecommissioned(tokenId, decommissionedBy, timestamp, event) {
  try {
    const id = Number(tokenId);
    const adminAddress = decommissionedBy.toLowerCase();
    const eventTime = new Date(Number(timestamp) * 1000);
    const { txHash, blockNum } = getTxAndBlock(event);

    const existingLog = await AuditLog.findOne({
      transactionHash: txHash,
      eventType: "AssetDecommissioned",
    });

    if (!existingLog) {
      await AuditLog.create({
        eventType: "AssetDecommissioned",
        contractName: "AssetNFT",
        transactionHash: txHash,
        blockNumber: blockNum,
        args: {
          tokenId: id,
          decommissionedBy: adminAddress,
          timestamp: Number(timestamp),
        },
        timestamp: eventTime,
      });
    }

    // Mark Asset decommissioned
    await Asset.findOneAndUpdate(
      { tokenId: id },
      { isDecommissioned: true }
    );

    console.log(`[Indexer] AssetDecommissioned: tokenId=${id} decommissionedBy=${adminAddress}`);
  } catch (err) {
    console.error("[Indexer] Error processing AssetDecommissioned:", err.message);
  }
}

/**
 * Performs backfill query for past events.
 */
async function backfillEvents(identityContract, assetContract, currentBlock) {
  try {
    console.log(`[Indexer] Querying historical events up to block ${currentBlock}...`);

    const idRegistered = (await identityContract.queryFilter("IdentityRegistered", 0, currentBlock)).map((e) => ({
      type: "IdentityRegistered",
      e,
    }));
    const idDeactivated = (await identityContract.queryFilter("IdentityDeactivated", 0, currentBlock)).map((e) => ({
      type: "IdentityDeactivated",
      e,
    }));
    const roleGranted = (await identityContract.queryFilter("RoleGrantedAudit", 0, currentBlock)).map((e) => ({
      type: "RoleGrantedAudit",
      e,
    }));
    const assetMinted = (await assetContract.queryFilter("AssetMinted", 0, currentBlock)).map((e) => ({
      type: "AssetMinted",
      e,
    }));
    const assetTransferred = (await assetContract.queryFilter("AssetTransferredWithAudit", 0, currentBlock)).map(
      (e) => ({ type: "AssetTransferredWithAudit", e })
    );
    const assetDecommissioned = (await assetContract.queryFilter("AssetDecommissioned", 0, currentBlock)).map(
      (e) => ({ type: "AssetDecommissioned", e })
    );

    const allEvents = [
      ...idRegistered,
      ...idDeactivated,
      ...roleGranted,
      ...assetMinted,
      ...assetTransferred,
      ...assetDecommissioned,
    ].sort((a, b) => {
      if (a.e.blockNumber !== b.e.blockNumber) return a.e.blockNumber - b.e.blockNumber;
      return (a.e.index ?? 0) - (b.e.index ?? 0);
    });

    for (const item of allEvents) {
      const evt = item.e;
      switch (item.type) {
        case "IdentityRegistered":
          await handleIdentityRegistered(evt.args[0], evt.args[1], evt.args[2], evt.args[3], evt);
          break;
        case "IdentityDeactivated":
          await handleIdentityDeactivated(evt.args[0], evt.args[1], evt);
          break;
        case "RoleGrantedAudit":
          await handleRoleGrantedAudit(evt.args[0], evt.args[1], evt.args[2], evt.args[3], evt);
          break;
        case "AssetMinted":
          await handleAssetMinted(evt.args[0], evt.args[1], evt.args[2], evt.args[3], evt.args[4], evt);
          break;
        case "AssetTransferredWithAudit":
          await handleAssetTransferredWithAudit(evt.args[0], evt.args[1], evt.args[2], evt.args[3], evt);
          break;
        case "AssetDecommissioned":
          await handleAssetDecommissioned(evt.args[0], evt.args[1], evt);
          break;
      }
    }

    console.log(`[Indexer] Historical backfill complete (${allEvents.length} events processed).`);
  } catch (err) {
    console.warn("[Indexer] Historical backfill notice:", err.message);
  }
}

/**
 * Starts listening to blockchain events.
 */
async function startListening() {
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  listenerState.rpcUrl = rpcUrl;

  try {
    const { identityRegistryAddress, assetNFTAddress, identityAbi, assetAbi } = loadContractConfigs();
    listenerState.identityRegistryAddress = identityRegistryAddress;
    listenerState.assetNFTAddress = assetNFTAddress;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    provider.pollingInterval = 1000;

    // Test connectivity to RPC provider
    let currentBlock = 0;
    try {
      currentBlock = await provider.getBlockNumber();
      listenerState.lastIndexedBlock = currentBlock;
      console.log(`[Indexer] Connected to RPC at ${rpcUrl} (Current block: ${currentBlock})`);
    } catch (rpcErr) {
      console.warn(`[Indexer] Could not connect to RPC node at ${rpcUrl} (${rpcErr.message}).`);
      console.warn("[Indexer] Listener will stay in offline standby mode until node is started.");
      listenerState.error = rpcErr.message;
      return;
    }

    const identityContract = new ethers.Contract(identityRegistryAddress, identityAbi, provider);
    const assetContract = new ethers.Contract(assetNFTAddress, assetAbi, provider);

    // 1. Backfill past events from block 0
    await backfillEvents(identityContract, assetContract, currentBlock);

    // 2. Attach real-time event listeners
    identityContract.on("IdentityRegistered", (user, did, role, timestamp, event) => {
      handleIdentityRegistered(user, did, role, timestamp, event);
    });

    identityContract.on("IdentityDeactivated", (user, timestamp, event) => {
      handleIdentityDeactivated(user, timestamp, event);
    });

    identityContract.on("RoleGrantedAudit", (user, role, grantedBy, timestamp, event) => {
      handleRoleGrantedAudit(user, role, grantedBy, timestamp, event);
    });

    assetContract.on("AssetMinted", (tokenId, owner, metadataHash, mintedBy, timestamp, event) => {
      handleAssetMinted(tokenId, owner, metadataHash, mintedBy, timestamp, event);
    });

    assetContract.on("AssetTransferredWithAudit", (tokenId, from, to, timestamp, event) => {
      handleAssetTransferredWithAudit(tokenId, from, to, timestamp, event);
    });

    assetContract.on("AssetDecommissioned", (tokenId, decommissionedBy, timestamp, event) => {
      handleAssetDecommissioned(tokenId, decommissionedBy, timestamp, event);
    });

    listenerState.isListening = true;
    listenerState.error = null;
    console.log("[Indexer] Real-time event listener active for IdentityRegistry and AssetNFT.");
  } catch (error) {
    listenerState.isListening = false;
    listenerState.error = error.message;
    console.error("[Indexer] Failed to initialize event listener:", error.message);
  }
}

function getListenerStatus() {
  return { ...listenerState };
}

module.exports = {
  startListening,
  getListenerStatus,
  formatRole,
  handleIdentityRegistered,
  handleIdentityDeactivated,
  handleRoleGrantedAudit,
  handleAssetMinted,
  handleAssetTransferredWithAudit,
  handleAssetDecommissioned,
};
