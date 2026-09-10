# Smart Contracts Scope & Design Notes

This directory contains the core smart contracts for the SIH 26125 platform.

---

## 1. IdentityRegistry.sol (Phase 1 Scope)

- **Purpose**: Decentralized Identity (DID) registration and Role-Based Access Control (RBAC).
- **Standards & Dependencies**:
  - OpenZeppelin `AccessControl.sol`
- **Core Roles**:
  - `DEFAULT_ADMIN_ROLE` / `ADMIN_ROLE`: Can register users, assign/revoke roles, and deactivate identities.
  - `MANAGER_ROLE`: Can approve asset operations and manage assigned departments.
  - `AUDITOR_ROLE`: Read-only access to complete history, specialized verification functions.
  - `USER_ROLE`: Base role for registered members possessing digital assets.
- **Key Functionality**:
  - Mapping Ethereum address to DID string and role.
  - Revocation/deactivation flags.
  - Audit event emissions on all identity status changes.

---

## 2. AssetNFT.sol (Phase 2 Scope)

- **Purpose**: Digital asset tokenization and ownership lifecycle management under strict RBAC constraints.
- **Standards & Dependencies**:
  - OpenZeppelin `ERC721.sol`, `ERC721URIStorage.sol`
  - Integration with `IdentityRegistry.sol`
- **Key Functionality**:
  - **Minting Rule**: Only accounts with `ADMIN_ROLE` or `MANAGER_ROLE` verified by `IdentityRegistry` can mint new assets.
  - **Transfer Rule**: Assets can only be transferred to recipient addresses that are active, verified identities in `IdentityRegistry`.
  - **Metadata**: Links on-chain token ID with IPFS content hashes (storing documents, schematics, asset attributes).
  - **Audit Logging**: Emits granular lifecycle events whenever assets are created, transferred, updated, or decommissioned.

---

## 3. Future Contracts (Phase 2 / Phase 5 Extensions)
- `AuditLogRegistry.sol` (Optional on-chain hash anchoring for audit batches).
