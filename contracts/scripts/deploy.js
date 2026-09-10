/**
 * @file deploy.js
 * @description Hardhat deployment script for SIH 26125 smart contracts.
 *              Deploys IdentityRegistry, logs address, and writes deployed-addresses.json.
 * @phase Phase 1 (IdentityRegistry deployment implemented) & Phase 2 (AssetNFT deployment placeholder).
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment for VeriFind Plus (SIH 26125 platform)...");

  // Phase 1: Deploy IdentityRegistry
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();

  console.log("IdentityRegistry deployed successfully to:", identityRegistryAddress);

  // TODO [Phase 2]: Deploy AssetNFT linked to IdentityRegistry
  // const AssetNFT = await hre.ethers.getContractFactory("AssetNFT");
  // const assetNft = await AssetNFT.deploy(identityRegistryAddress);
  // await assetNft.waitForDeployment();
  // console.log("AssetNFT deployed to:", await assetNft.getAddress());

  // Save deployed addresses record
  const networkName = hre.network.name || "localhost";
  const outputData = {
    identityRegistry: identityRegistryAddress,
    network: networkName,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), "utf8");
  console.log("Deployment configuration saved to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
