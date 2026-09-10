# Backend Controllers Specification (Phase 3 Scope)

Controllers handle incoming HTTP requests, input validation, interaction with Mongoose models, and responses.

---

## 1. `identityController.js`
- **`registerUser`**: Validates request body (wallet address, name, email), verifies on-chain signature/registration, creates User document in MongoDB.
- **`getUserProfile`**: Fetches user details by Ethereum address, including active DID document and role assignments.
- **`listUsers`**: Supports pagination and filtering by role (`ADMIN`, `MANAGER`, `AUDITOR`, `USER`) or status (`active`, `deactivated`).
- **`updateUserStatus`**: Handles admin status updates and synchronization with on-chain deactivation events.

---

## 2. `assetController.js`
- **`createAssetDraft`**: Handles upload of digital asset files, computes SHA-256 / IPFS CID hash, and stages metadata for minting.
- **`listAssets`**: Retrieves catalog of digital assets with search, category filtering, and ownership lookup.
- **`getAssetById`**: Returns asset details along with provenance timeline and cryptographic hashes.
- **`getAssetsByOwner`**: Returns all tokens currently in possession of a specific identity.

---

## 3. `auditController.js`
- **`getAuditTrail`**: Returns chronological, filterable list of indexed blockchain events.
- **`verifyAuditRecord`**: Queries RPC provider using transaction hash and verifies stored log parameters against receipt logs.
- **`getAuditStatistics`**: Computes aggregation metrics (total mints, active users, daily activity) for the dashboard.
