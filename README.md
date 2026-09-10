# Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management

**Smart India Hackathon (SIH 26125) — Organization: Bharat Electronics Limited (BEL)**

---

## 1. Project Overview

This platform provides a decentralized, tamper-proof system for:
- **Decentralized Identity (DID) Management**: Self-sovereign cryptographic identity management tied to Ethereum addresses.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions governed on-chain (`ADMIN`, `MANAGER`, `AUDITOR`, `USER`) via OpenZeppelin's `AccessControl`.
- **Digital Asset Management (ERC-721)**: Verifiable digital asset minting, lifecycle ownership tracking, and transfer constraints tied to verified identities.
- **Auditing & Event Indexing**: Comprehensive transparency with full on-chain event auditing captured by an off-chain MongoDB sync service.

---

## 2. System Architecture

```
    Users / Admin (MetaMask)
            │
            ▼
    React (Vite) Frontend  ── ethers.js ──►  Smart Contracts (Hardhat, local/testnet)
            │                                    │  IdentityRegistry (DIDs)
            │  REST API                          │  AccessControl / RBAC roles
            │                                    │  AssetNFT (ERC-721)
            ▼                                    │  emits events on every action
    Node/Express Backend                        │
            │                                    ▼
            │◄──── ethers.js event listener ── Blockchain
            ▼
    MongoDB (Mongoose)
    - users / profiles cache
    - DID documents
    - decoded audit-log events (identity created, NFT minted, transferred, role changed)
    - asset metadata (name, description, IPFS hash)
```

---

## 3. Technology Stack

- **Smart Contracts**: Solidity (0.8.20+), Hardhat, OpenZeppelin Contracts
- **Backend Service**: Node.js, Express, Mongoose (MongoDB), Ethers.js
- **Frontend Client**: React + Vite (JavaScript), Ethers.js, Lucide Icons
- **Local Blockchain**: Hardhat Network (`http://127.0.0.1:8545`)

---

## 4. Repository Structure

```
sih26125-identity-asset-platform/
├── PROGRESS.md                 # State tracker & phase execution ledger
├── README.md                   # Project documentation & overview
├── .gitignore                  # Git ignore rules
├── .env.example                # Unified local environment variables template
├── contracts/                  # Hardhat smart contracts workspace
│   ├── hardhat.config.js
│   ├── package.json
│   ├── contracts/
│   │   ├── IdentityRegistry.sol
│   │   ├── AssetNFT.sol
│   │   └── README.md
│   ├── scripts/
│   │   └── deploy.js
│   └── test/
│       └── placeholder.test.js
├── backend/                    # Express + MongoDB API service
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── config/db.js
│       ├── models/ (User.js, AuditLog.js, Asset.js)
│       ├── services/blockchainListener.js
│       ├── routes/README.md
│       └── controllers/README.md
├── frontend/                   # React + Vite application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/README.md
│       ├── pages/README.md
│       └── utils/contractConfig.js
├── data/                       # Sample static datasets & DID documents
│   ├── sample-did-documents.json
│   ├── sample-roles.json
│   └── README.md
└── docs/                       # Architecture diagrams, problem statement, phase roadmap
    ├── architecture-diagram.md
    ├── problem-statement.md
    └── phase-plan.md
```

---

## 5. Getting Started (Phase 0 Scaffold)

### Prerequisites
- Node.js (v18 or v20 recommended)
- MongoDB instance (local or Atlas URI)
- MetaMask browser extension

### Setup Instructions

1. **Contracts (Hardhat)**:
   ```bash
   cd contracts
   npm install
   npx hardhat node
   ```

2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

Refer to [PROGRESS.md](./PROGRESS.md) to check current phase status and next implementation steps.
