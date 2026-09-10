# System Architecture — SIH 26125

## 1. High-Level Architecture Flowchart

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Layer (Web Browser)                       │
│                                                                        │
│   MetaMask Wallet ──► React + Vite Single Page Application (SPA)       │
│                       ├── Web3 Provider (ethers.js v6)                │
│                       ├── Role-Gated Views (Admin, Manager, Auditor)  │
│                       └── REST Client (fetch / axios)                 │
└──────────────────────┬─────────────────────────┬───────────────────────┘
                       │                         │
            Direct JSON-RPC calls         REST API Requests
            (Wallet Signer)               (Queries & Cache)
                       │                         │
                       ▼                         ▼
┌──────────────────────────────────┐   ┌─────────────────────────────────┐
│     Smart Contracts Layer        │   │       Backend API Service       │
│   (Hardhat Node / Testnet)       │   │       (Node.js / Express)       │
│                                  │   │                                 │
│ ┌──────────────────────────────┐ │   │ ┌─────────────────────────────┐ │
│ │ IdentityRegistry.sol         │ │   │ │ REST API Endpoints          │ │
│ │ - DID mapping                │ │   │ │ (/api/identity, /assets,    │ │
│ │ - OpenZeppelin AccessControl │ │   │ │  /audit)                    │ │
│ └──────────────────────────────┘ │   │ └─────────────────────────────┘ │
│                 │                │   │                │                │
│                 ▼                │   │                ▼                │
│ ┌──────────────────────────────┐ │   │ ┌─────────────────────────────┐ │
│ │ AssetNFT.sol (ERC-721)       │ │   │ │ Blockchain Event Listener   │ │
│ │ - RBAC-guarded minting       │ │   │ │ (ethers.js indexer)         │ │
│ │ - DID-restricted transfers   │ │   │ └──────────────┬──────────────┘ │
│ └──────────────┬───────────────┘ │   └────────────────┼────────────────┘
└────────────────┼─────────────────┘                    │
                 │                                      │
                 │ Emits contract events                │ Decodes & indexes
                 └──────────────────────────────────────┘
                                                        │
                                                        ▼
                                       ┌─────────────────────────────────┐
                                       │         Database Layer          │
                                       │        (MongoDB / Mongoose)     │
                                       │                                 │
                                       │ - Users & DID Document Cache    │
                                       │ - Assets & IPFS Metadata        │
                                       │ - Immutable AuditLog Records    │
                                       └─────────────────────────────────┘
```

## 2. Core Architectural Components

### A. Client Layer (React + Vite)
- User authentication via MetaMask wallet connection.
- Reads user role directly from `IdentityRegistry.sol` via `ethers.js`.
- Interacts directly with smart contracts for transactional state changes (registration, minting, transfer).
- Queries Express REST endpoints for indexed histories, DID document formatting, and audit reports.

### B. Smart Contract Layer (Solidity on Hardhat/EVM)
- **`IdentityRegistry`**: The single source of truth for identities. Binds public addresses to DID strings and manages role permissions (`ADMIN`, `MANAGER`, `AUDITOR`, `USER`).
- **`AssetNFT`**: Tokenizes digital assets as ERC-721 tokens. Enforces business rules: only authorized roles can mint, and transfers are only valid to registered identities. Emits rich events on every state transition.

### C. Backend Indexer & REST Layer (Node/Express)
- Runs a daemon service via `ethers.js` subscribing to smart contract event logs.
- Decodes emitted events and stores structured records in MongoDB.
- Serves fast, indexed queries to the frontend without overloading RPC nodes.

### D. Persistence Layer (MongoDB)
- Stores cached user profiles, DID documents, asset metadata, and immutable audit logs linked to blockchain transaction hashes.
