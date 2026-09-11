/**
 * @file seed.js
 * @description Hardhat seed script for VeriFind Plus (SIH 26125 — Bharat Electronics Limited).
 *              Populates realistic demo data onto the localhost network:
 *              1. Registers 5 identities across roles (Admin, Manager, Auditor, User, User).
 *              2. Mints 4 defense/enterprise digital assets tied to registered identities.
 *              3. Performs asset ownership transfer between departments.
 *              4. Promotes a User identity to Manager tier.
 *              5. Deactivates a User identity to demonstrate revoked privileges.
 *              6. Verifies that deactivated identity cannot receive new assets.
 *
 * @usage npx hardhat run scripts/seed.js --network localhost
 * @note Safe to re-run: checks existing identity status and token ownership before executing transactions.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=======================================================");
  console.log("  VeriFind Plus — Smart Contract Seeding Engine");
  console.log("  Project: SIH 26125 (Bharat Electronics Limited)");
  console.log("=======================================================\n");

  const networkName = hre.network.name;
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.warn(`[WARNING] Running against network '${networkName}'. Expected 'localhost'.`);
  }

  // 1. Load deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(addressesPath)) {
    throw new Error(`Deployed addresses file not found at: ${addressesPath}`);
  }
  const deployedAddresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const { identityRegistry: idRegAddr, assetNFT: assetNftAddr } = deployedAddresses;

  console.log(`[Config] IdentityRegistry address: ${idRegAddr}`);
  console.log(`[Config] AssetNFT address:         ${assetNftAddr}\n`);

  // 2. Obtain signers
  const signers = await hre.ethers.getSigners();
  if (signers.length < 6) {
    throw new Error(`At least 6 signers required. Found: ${signers.length}`);
  }

  const deployerAdmin = signers[0]; // Holds ADMIN_ROLE & MINTER_ROLE
  const secondAdmin   = signers[1];
  const manager       = signers[2];
  const auditor       = signers[3];
  const operatorAlpha = signers[4];
  const techBeta      = signers[5];

  // Attach contracts
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = IdentityRegistry.attach(idRegAddr).connect(deployerAdmin);

  const AssetNFT = await hre.ethers.getContractFactory("AssetNFT");
  const assetNft = AssetNFT.attach(assetNftAddr).connect(deployerAdmin);

  // Role Hashes
  const ADMIN_ROLE   = await identityRegistry.ADMIN_ROLE();
  const MANAGER_ROLE = await identityRegistry.MANAGER_ROLE();
  const AUDITOR_ROLE = await identityRegistry.AUDITOR_ROLE();
  const USER_ROLE    = await identityRegistry.USER_ROLE();

  // -------------------------------------------------------------
  // STEP 1: Register 5 Identities
  // -------------------------------------------------------------
  console.log("--- STEP 1: Registering 5 Realistic Identities ---");

  const identitiesToSeed = [
    {
      signer: secondAdmin,
      name: "Commander A. Sharma (SecOps Admin)",
      did: `did:ethr:${secondAdmin.address}`,
      role: ADMIN_ROLE,
      roleName: "ADMIN_ROLE",
    },
    {
      signer: manager,
      name: "Dr. P. Nair (Radar Systems Manager)",
      did: `did:ethr:${manager.address}`,
      role: MANAGER_ROLE,
      roleName: "MANAGER_ROLE",
    },
    {
      signer: auditor,
      name: "V. Raghavan (Compliance & Audit Inspector)",
      did: `did:ethr:${auditor.address}`,
      role: AUDITOR_ROLE,
      roleName: "AUDITOR_ROLE",
    },
    {
      signer: operatorAlpha,
      name: "R. Kulkarni (Defense Payload Operator)",
      did: `did:ethr:${operatorAlpha.address}`,
      role: USER_ROLE,
      roleName: "USER_ROLE",
    },
    {
      signer: techBeta,
      name: "T. Sengupta (Field Maintenance Technician)",
      did: `did:ethr:${techBeta.address}`,
      role: USER_ROLE,
      roleName: "USER_ROLE",
    },
  ];

  for (const item of identitiesToSeed) {
    const existing = await identityRegistry.getIdentity(item.signer.address);
    if (existing.isActive || existing.did.length > 0) {
      console.log(`[Skip] Identity already registered for ${item.name} (${item.signer.address.slice(0, 10)}...)`);
    } else {
      console.log(`[Registering] ${item.name}`);
      console.log(`  Address: ${item.signer.address}`);
      console.log(`  DID:     ${item.did}`);
      console.log(`  Role:    ${item.roleName}`);

      const tx = await identityRegistry.registerIdentity(item.signer.address, item.did, item.role);
      const receipt = await tx.wait();
      console.log(`  Tx Hash: ${receipt.hash} (Block #${receipt.blockNumber})\n`);
    }
  }

  // Also register deployer if not registered
  const deployerIdentity = await identityRegistry.getIdentity(deployerAdmin.address);
  if (!deployerIdentity.isActive && deployerIdentity.did.length === 0) {
    console.log(`[Registering] Deployer / Primary Admin`);
    const deployerDid = `did:ethr:${deployerAdmin.address}`;
    const tx = await identityRegistry.registerIdentity(deployerAdmin.address, deployerDid, ADMIN_ROLE);
    const receipt = await tx.wait();
    console.log(`  Tx Hash: ${receipt.hash} (Block #${receipt.blockNumber})\n`);
  }

  // -------------------------------------------------------------
  // STEP 2: Mint 4 Digital Assets
  // -------------------------------------------------------------
  console.log("\n--- STEP 2: Minting Defense Digital Assets (ERC-721) ---");

  const assetsToSeed = [
    {
      recipient: manager.address,
      recipientName: "Dr. P. Nair (Radar Systems Manager)",
      metadataHash: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      label: "BEL Active Phased Array Radar Calibration Matrix v4.1",
    },
    {
      recipient: operatorAlpha.address,
      recipientName: "R. Kulkarni (Defense Payload Operator)",
      metadataHash: "ipfs://bafybeihkoviema7g3gxyt6hel2pti26z2tshcvyv3dmpxe2gnjefy26jdy",
      label: "Tactical SDR Secure Firmware Build v2.3 (SHA-256 Verified)",
    },
    {
      recipient: secondAdmin.address,
      recipientName: "Commander A. Sharma (SecOps Admin)",
      metadataHash: "ipfs://bafybeicg4f6yub4fquz4x5lq7o6vd76uhq3y26nf3efuylqabf3oclgtqy",
      label: "BEL High-Security Zone-4 Digital Facility Access Credential",
    },
    {
      recipient: techBeta.address,
      recipientName: "T. Sengupta (Field Maintenance Technician)",
      metadataHash: "ipfs://bafybeifx3w7yub5fquz4x5lq7o6vd76uhq3y26nf3efuylqabf3oclgtqy",
      label: "ECC-384 Master Encryption Key Derivation Bundle #09",
    },
  ];

  for (let i = 0; i < assetsToSeed.length; i++) {
    const asset = assetsToSeed[i];
    const expectedTokenId = i + 1;

    let alreadyExists = false;
    try {
      const owner = await assetNft.ownerOf(expectedTokenId);
      if (owner !== hre.ethers.ZeroAddress) {
        alreadyExists = true;
        console.log(`[Skip] Asset #${expectedTokenId} already minted (Owner: ${owner})`);
      }
    } catch {
      // Token doesn't exist yet, proceed to mint
    }

    if (!alreadyExists) {
      console.log(`[Minting] Asset #${expectedTokenId}: ${asset.label}`);
      console.log(`  Recipient: ${asset.recipientName} (${asset.recipient})`);
      console.log(`  Metadata:  ${asset.metadataHash}`);

      const tx = await assetNft.mintAsset(asset.recipient, asset.metadataHash);
      const receipt = await tx.wait();
      console.log(`  Tx Hash:   ${receipt.hash} (Block #${receipt.blockNumber})\n`);
    }
  }

  // -------------------------------------------------------------
  // STEP 3: Department Asset Transfer (Handover)
  // -------------------------------------------------------------
  console.log("\n--- STEP 3: Simulating Inter-Department Asset Transfer ---");
  const transferTokenId = 2; // "Tactical SDR Secure Firmware Build v2.3"
  let currentOwner = hre.ethers.ZeroAddress;
  try {
    currentOwner = await assetNft.ownerOf(transferTokenId);
  } catch {
    // Token not minted
  }

  if (currentOwner.toLowerCase() === operatorAlpha.address.toLowerCase()) {
    console.log(`[Transferring] Token #${transferTokenId} from Operator Alpha to Manager Dr. P. Nair...`);
    const transferTx = await assetNft.connect(operatorAlpha).transferFrom(
      operatorAlpha.address,
      manager.address,
      transferTokenId
    );
    const receipt = await transferTx.wait();
    console.log(`  From:    ${operatorAlpha.address}`);
    console.log(`  To:      ${manager.address}`);
    console.log(`  Tx Hash: ${receipt.hash} (Block #${receipt.blockNumber})\n`);
  } else {
    console.log(`[Notice] Token #${transferTokenId} current owner is ${currentOwner} (transfer already executed or different owner).\n`);
  }

  // -------------------------------------------------------------
  // STEP 4: Role Promotion (USER -> MANAGER)
  // -------------------------------------------------------------
  console.log("--- STEP 4: Role Hierarchy Update & Audit Trail ---");
  const userCurrentIdentity = await identityRegistry.getIdentity(operatorAlpha.address);

  if (userCurrentIdentity.role === USER_ROLE) {
    console.log(`[Role Update] Promoting Operator Alpha (${operatorAlpha.address}) from USER_ROLE to MANAGER_ROLE...`);
    const roleTx = await identityRegistry.updateRole(operatorAlpha.address, MANAGER_ROLE);
    const receipt = await roleTx.wait();
    console.log(`  Granted By: ${deployerAdmin.address}`);
    console.log(`  New Role:   MANAGER_ROLE`);
    console.log(`  Tx Hash:    ${receipt.hash} (Block #${receipt.blockNumber})\n`);
  } else {
    console.log(`[Notice] Operator Alpha role is already updated (Current role: ${userCurrentIdentity.role}).\n`);
  }

  // -------------------------------------------------------------
  // STEP 5: Identity Deactivation & Revert Test
  // -------------------------------------------------------------
  console.log("--- STEP 5: Identity Deactivation (Revocation of Privileges) ---");
  const techIdentity = await identityRegistry.getIdentity(techBeta.address);

  if (techIdentity.isActive) {
    console.log(`[Deactivating] Field Technician Beta (${techBeta.address}) due to credential cycle offboarding...`);
    const deactTx = await identityRegistry.deactivateIdentity(techBeta.address);
    const receipt = await deactTx.wait();
    console.log(`  Deactivated: ${techBeta.address}`);
    console.log(`  Tx Hash:     ${receipt.hash} (Block #${receipt.blockNumber})\n`);
  } else {
    console.log(`[Notice] Field Technician Beta is already deactivated.\n`);
  }

  // Test: verify minting to deactivated identity reverts
  console.log("--- STEP 6: Verification of Security Boundary (Mint to Inactive Identity) ---");
  try {
    console.log(`[Security Test] Attempting to mint new asset to deactivated address (${techBeta.address})...`);
    await assetNft.mintAsset(techBeta.address, "ipfs://bafybeirevertchecktestdummyhash12345");
    console.error("[CRITICAL ERROR] Mint to deactivated address should have reverted!");
  } catch (err) {
    console.log(`[PASS] Reverted as expected: "${err.message.split("\n")[0]}"\n`);
  }

  // -------------------------------------------------------------
  // FINAL SUMMARY REPORT
  // -------------------------------------------------------------
  console.log("=======================================================");
  console.log("  SEEDING COMPLETE — SEEDED ACCOUNTS SUMMARY");
  console.log("=======================================================");
  console.table([
    { Index: 0, Role: "ADMIN (Deployer)", Address: deployerAdmin.address, Status: "Active" },
    { Index: 1, Role: "ADMIN (SecOps)", Address: secondAdmin.address, Status: "Active" },
    { Index: 2, Role: "MANAGER (Radar)", Address: manager.address, Status: "Active" },
    { Index: 3, Role: "AUDITOR (Inspect)", Address: auditor.address, Status: "Active" },
    { Index: 4, Role: "MANAGER (Promoted)", Address: operatorAlpha.address, Status: "Active" },
    { Index: 5, Role: "USER (Revoked)", Address: techBeta.address, Status: "Deactivated" },
  ]);
  console.log("=======================================================\n");
}

main().catch((error) => {
  console.error("[Fatal Error in Seed Script]:", error);
  process.exitCode = 1;
});
