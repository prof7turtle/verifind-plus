# Full Project Roadmap (Phase 0 to Phase 6)

Project: **Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management**  
Problem ID: **SIH 26125 (Bharat Electronics Limited)**

---

## Roadmap Overview

### Phase 0: Scaffolding (COMPLETED)
- Create folder and file skeleton for `contracts/`, `backend/`, `frontend/`, `data/`, and `docs/`.
- Establish configuration files (`.gitignore`, `.env.example`, `package.json` manifests, Hardhat config, Vite config).
- Create code skeletons with descriptive headers and TODO comments.
- Initialize `PROGRESS.md` as the authoritative state tracker for all subsequent sessions.

### Phase 1: Smart Contracts — IdentityRegistry + RBAC
- Implement `IdentityRegistry.sol` using Solidity 0.8.20+.
- Integrate OpenZeppelin `AccessControl` for roles: `ADMIN_ROLE`, `MANAGER_ROLE`, `AUDITOR_ROLE`, `USER_ROLE`.
- Implement DID string registration bound to Ethereum addresses.
- Write unit tests in Hardhat (`test/identityRegistry.test.js`).
- Deploy locally to Hardhat network using `scripts/deploy.js`.

### Phase 2: Smart Contracts — AssetNFT (ERC-721)
- Implement `AssetNFT.sol` inheriting OpenZeppelin `ERC721URIStorage`.
- Link minting permissions to `IdentityRegistry` roles (only ADMIN/MANAGER can mint).
- Implement transfer rules restricting recipient addresses to verified identities in `IdentityRegistry`.
- Support IPFS metadata hashes.
- Write comprehensive unit tests for minting, transfers, and unauthorized attempt rejections.

### Phase 3: Backend Service & Indexer
- Express.js REST API setup with Mongoose models (`User`, `Asset`, `AuditLog`).
- Build `blockchainListener.js` utilizing `ethers.js` JsonRpcProvider and contract event subscriptions.
- Index on-chain events (`IdentityRegistered`, `RoleGranted`, `Transfer`, `AssetMinted`) into MongoDB.
- Expose REST API endpoints for frontend queries:
  - Identity lookup and DID documents
  - Asset catalog and ownership queries
  - Tamper-proof audit logs and verification endpoints

### Phase 4: Frontend Web Application
- React (Vite) Single Page Application in JavaScript.
- Wallet connection integration with MetaMask via `ethers.js`.
- Role-gated interface:
  - **Admin Panel**: Identity registration, role assignment, revocation.
  - **Asset Manager**: Digital asset minting modal, IPFS staging, transfer dashboard.
  - **Auditor View**: Filterable audit event table with transaction hash links and verification badges.
  - **User Portal**: Personal asset inventory and DID credentials.

### Phase 5: Integration, Seed Data & End-to-End Testing
- Automated seeding scripts for local demonstration (admin, managers, auditors, users, sample assets).
- End-to-end user workflow verification across blockchain, backend indexer, and frontend UI.
- Performance and edge-case handling (wallet disconnections, invalid transfers).

### Phase 6: Documentation, Pitch Deck & Final Presentation
- Finalize system architecture diagrams and technical documentation.
- Prepare demonstration script and pitch deck for SIH / BEL evaluation.
- Record prototype walkthrough.

---

## Fixed Technical Decisions (Do Not Deviate)
- **Smart Contracts**: Solidity + Hardhat + OpenZeppelin (`AccessControl`, `ERC721`)
- **Backend**: Node.js + Express + Mongoose (MongoDB)
- **Frontend**: React + Vite (JavaScript, not TypeScript, for hackathon agility) + ethers.js
- **Chain**: Hardhat Network for local development and demonstration
- **Package Manager**: npm
- **Architecture**: Lightweight prototype without Docker or Next.js overhead
