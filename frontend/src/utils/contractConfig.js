/**
 * @file contractConfig.js
 * @description Contract configuration, ABIs, and ethers.js contract helpers.
 * @phase Phase 4 (Frontend UI/UX)
 */

import { ethers } from "ethers";
import identityArtifact from "../contracts/IdentityRegistry.json";
import assetArtifact from "../contracts/AssetNFT.json";
import deployedAddresses from "../contracts/deployed-addresses.json";

export const TARGET_CHAIN_ID = 31337; // Hardhat Local Node
export const TARGET_NETWORK_NAME = "Hardhat Local (31337)";

export const IDENTITY_REGISTRY_ADDRESS =
  import.meta.env.VITE_IDENTITY_REGISTRY_ADDRESS || deployedAddresses.identityRegistry;

export const ASSET_NFT_ADDRESS =
  import.meta.env.VITE_ASSET_NFT_ADDRESS || deployedAddresses.assetNFT;

export const IDENTITY_REGISTRY_ABI = identityArtifact.abi;
export const ASSET_NFT_ABI = assetArtifact.abi;

// Role hash constants matching Solidity
export const ROLE_HASHES = {
  ADMIN_ROLE: ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
  MANAGER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("MANAGER_ROLE")),
  AUDITOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE")),
  USER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("USER_ROLE")),
};

/**
 * Returns an instance of IdentityRegistry bound to a provider or signer.
 */
export function getIdentityContract(runner) {
  if (!IDENTITY_REGISTRY_ADDRESS) {
    throw new Error("IdentityRegistry address not configured");
  }
  return new ethers.Contract(IDENTITY_REGISTRY_ADDRESS, IDENTITY_REGISTRY_ABI, runner);
}

/**
 * Returns an instance of AssetNFT bound to a provider or signer.
 */
export function getAssetContract(runner) {
  if (!ASSET_NFT_ADDRESS) {
    throw new Error("AssetNFT address not configured");
  }
  return new ethers.Contract(ASSET_NFT_ADDRESS, ASSET_NFT_ABI, runner);
}
