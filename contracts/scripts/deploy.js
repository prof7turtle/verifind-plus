/**
 * @file deploy.js
 * @description Hardhat deployment script for SIH 26125 smart contracts.
 *              Deploys IdentityRegistry, then AssetNFT (injecting IdentityRegistry address),
 *              and configures initial admin roles.
 * @phase Phase 1 (IdentityRegistry deployment) & Phase 2 (AssetNFT deployment).
 */

const hre = require("hardhat");

async function main() {
  console.log("Starting deployment for SIH 26125 platform...");

  // TODO [Phase 1]: Deploy IdentityRegistry
  // const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  // const identityRegistry = await IdentityRegistry.deploy();
  // await identityRegistry.waitForDeployment();
  // console.log("IdentityRegistry deployed to:", await identityRegistry.getAddress());

  // TODO [Phase 2]: Deploy AssetNFT linked to IdentityRegistry
  // const AssetNFT = await hre.ethers.getContractFactory("AssetNFT");
  // const assetNft = await AssetNFT.deploy(await identityRegistry.getAddress());
  // await assetNft.waitForDeployment();
  // console.log("AssetNFT deployed to:", await assetNft.getAddress());

  // TODO [Phase 1/2]: Export contract addresses and ABIs to backend and frontend configs

  console.log("Deployment script placeholder executed (Phase 0 scaffold).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
