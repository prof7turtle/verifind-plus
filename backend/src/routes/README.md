# Backend Routes Specification (Phase 3 Scope)

This directory will contain Express route modules mapped to system domains:

---

## 1. `identity.routes.js`
- `POST /api/identity/register` — Register new user profile, metadata, and link to on-chain identity tx.
- `GET  /api/identity/:address` — Retrieve verified profile, assigned DID document, and RBAC role.
- `GET  /api/identity` — List all registered platform identities (filter by role / active status).
- `PATCH /api/identity/:address/status` — Admin update for user profile or deactivation status.

---

## 2. `asset.routes.js`
- `POST /api/assets` — Save asset metadata, pin to IPFS, and initiate on-chain minting metadata.
- `GET  /api/assets` — Query digital assets (filter by owner, category, status, keyword).
- `GET  /api/assets/:tokenId` — Detailed asset view with complete ownership lineage and IPFS links.
- `GET  /api/assets/owner/:address` — List all assets currently held by a specific verified identity.

---

## 3. `audit.routes.js`
- `GET  /api/audit` — Query tamper-proof audit events indexed from blockchain events.
- `GET  /api/audit/asset/:tokenId` — Full chronological audit history for a specific asset token.
- `GET  /api/audit/user/:address` — Activity log for actions performed by or targeting a specific user.
- `GET  /api/audit/verify/:txHash` — Compare stored database record against on-chain transaction receipt.
