# Progress Tracker — SIH 26125 Identity/Access/Asset Platform

## Current Phase
Phase 3 — Backend: Express + Mongoose + Blockchain Indexer (COMPLETE)

## Completed
### Phase 0 — Scaffolding
- [x] Root config files created (.gitignore, .env.example, README.md)
- [x] contracts/ folder scaffolded (Hardhat config, empty contract skeletons)
- [x] backend/ folder scaffolded (Express skeleton, Mongoose model stubs)
- [x] frontend/ folder scaffolded (Vite React skeleton)
- [x] data/ sample JSON files created
- [x] docs/ notes created

### Phase 1 — Smart Contracts Core
- [x] Implemented IdentityRegistry.sol inheriting OpenZeppelin AccessControl (^0.8.20)
- [x] Defined roles (ADMIN_ROLE, MANAGER_ROLE, AUDITOR_ROLE, USER_ROLE) and assigned deployer as admin
- [x] Configured role admin hierarchy (_setRoleAdmin) allowing ADMIN_ROLE to manage operational roles
- [x] Created Identity struct, identities mapping, and didToAddress duplicate-prevention mapping
- [x] Implemented audit trail events: IdentityRegistered, IdentityDeactivated, RoleGrantedAudit
- [x] Implemented registerIdentity, updateRole, deactivateIdentity, getIdentity, and hasActiveRole functions
- [x] Replaced IdentityRegistry test suite in placeholder.test.js with comprehensive Hardhat/Chai unit tests (10 passing tests)
- [x] Updated deploy.js to deploy IdentityRegistry and output deployed-addresses.json

### Phase 2 — Smart Contracts: AssetNFT
- [x] Implemented AssetNFT.sol inheriting OpenZeppelin ERC721 and AccessControl
- [x] Bound immutable IdentityRegistry reference with constructor validation
- [x] Defined ADMIN_ROLE and MINTER_ROLE constants and granted to deployer
- [x] Created token counter (_nextTokenId = 1), metadata hash mapping, and mintedAt mapping
- [x] Implemented audit trail events: AssetMinted, AssetTransferredWithAudit, AssetDecommissioned
- [x] Implemented mintAsset restricted to MINTER_ROLE requiring active identity in IdentityRegistry
- [x] Overrode OpenZeppelin v5 _update hook to emit AssetTransferredWithAudit on token transfers
- [x] Implemented decommissionAsset burning tokens restricted to ADMIN_ROLE
- [x] Implemented getAssetInfo view and supportsInterface ERC-165 dual inheritance override
- [x] Added comprehensive unit tests in placeholder.test.js (8 passing tests, 18 total across suite)
- [x] Updated deploy.js to deploy AssetNFT and write both contract addresses to deployed-addresses.json

### Phase 3 — Backend: Express + Mongoose + Blockchain Event Indexer
- [x] Implemented real Mongoose models (User, Asset, AuditLog) with validation, indexes, and immutability guards
- [x] Configured resilient MongoDB connection in config/db.js with exit-on-error handling
- [x] Built blockchain event listener in services/blockchainListener.js subscribing to all 6 contract events via ethers.js
- [x] Added chronological event backfill processing historical blocks on startup
- [x] Implemented REST controllers and routes for identities (list, get by address)
- [x] Implemented REST controllers and routes for assets (list, get by tokenId, owner filter, decommissioning flag)
- [x] Implemented REST controllers and routes for audit logs (list with eventType/contractName filters, address history)
- [x] Implemented /api/health endpoint reporting MongoDB and blockchain indexer real-time status
- [x] Verified live integration on local node with MongoDB: events indexed and queried over REST API

## Tech Stack (fixed — do not change)
- Contracts: Solidity, Hardhat, OpenZeppelin
- Backend: Node.js, Express, MongoDB via Mongoose
- Frontend: React + Vite (JavaScript), ethers.js
- No Next.js, no Docker for prototype phase

## Next Phase To Execute
Phase 4 — Frontend: React + Vite + ethers.js
Scope: Implement wallet connect (MetaMask), Admin panel (register identity form, mint asset form),
Asset list view, Audit log view. Consume the Phase 3 REST API for read views; write operations
(registerIdentity, mintAsset) call the smart contracts directly via ethers.js from the browser
wallet, not through the backend. Do NOT modify backend/ or contracts/ in Phase 4.

## Notes / Decisions Log
- 2026-09-10: Phase 0 scaffolding initialized. Folder structure, configs, contract skeletons, backend stubs, frontend React/Vite shell, sample data, and documentation created.
- 2026-09-10: Confirmed lightweight prototype constraints (pure React + Vite JS, Express + Mongoose, Hardhat local chain).
- 2026-09-10: Phase 1 complete. Implemented IdentityRegistry.sol with OpenZeppelin AccessControl, role admin hierarchies, audit trail events, full unit test suite, and deployed-addresses.json generation. Set ADMIN_ROLE as admin for MANAGER/AUDITOR/USER roles. Added input validation checks (zero address, empty DID string) to ensure contract safety.
- 2026-09-10: Phase 2 complete. Implemented AssetNFT.sol linked to IdentityRegistry. Added Solidity 0.8.24 with cancun evmVersion to hardhat.config.js for OpenZeppelin v5 Bytes.sol/ERC721 compatibility. Full unit test suite passing (18/18 tests). Updated deploy.js and deployed-addresses.json.
- 2026-09-10: Phase 3 complete. Implemented Mongoose models, Express REST endpoints, and ethers.js blockchain indexer. Immutability hooks added to AuditLog schema. Implemented chronological historical event backfill. Verified live end-to-end event indexing and API querying with local Hardhat node and MongoDB.
