/**
 * @file contractConfig.js
 * @description Contract ABIs and network addresses configuration for ethers.js.
 * 
 * FUTURE PURPOSE:
 * - Exports deployed contract addresses loaded from Vite environment variables.
 * - Exports compiled contract ABIs (IdentityRegistry and AssetNFT) from Hardhat artifacts.
 * - Provides contract helper instances bound to provider or signer.
 * 
 * TARGET PHASE:
 * - Phase 4: Frontend — React (Vite) + ethers.js, wallet connect, Admin panel, Audit/Asset views
 */

export const CONTRACT_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || 31337,
  rpcUrl: import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545",
  identityRegistry: {
    address: import.meta.env.VITE_IDENTITY_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    // TODO [Phase 4]: Import ABI from hardhat artifact or JSON file
    abi: [],
  },
  assetNFT: {
    address: import.meta.env.VITE_ASSET_NFT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    // TODO [Phase 4]: Import ABI from hardhat artifact or JSON file
    abi: [],
  },
};
