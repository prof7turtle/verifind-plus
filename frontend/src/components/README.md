# Frontend Components Scope (Phase 4 Scope)

This directory will house reusable UI components for the React application:

---

## 1. `WalletConnect.jsx`
- Handles MetaMask wallet connection via `window.ethereum` and `ethers.BrowserProvider`.
- Displays truncated user address, network chain status, and current RBAC role badge.
- Listens for account and network change events.

---

## 2. `AdminPanel.jsx`
- Available only to accounts with `ADMIN_ROLE`.
- Form to register new identities with DID strings and initial roles (`MANAGER`, `AUDITOR`, `USER`).
- Management table to revoke or grant specific permissions on-chain.

---

## 3. `AssetTable.jsx`
- Displays list of digital assets owned by the user or cataloged platform-wide.
- Includes action triggers: "Mint Asset" (for Admin/Manager), "Transfer Asset" (with recipient DID verification check), and "View Provenance".

---

## 4. `AuditLogTable.jsx`
- Filterable, searchable table of on-chain audit records retrieved from backend indexer.
- Direct links to local Hardhat / testnet block explorers by transaction hash.
- Status verification badge confirming data authenticity.
