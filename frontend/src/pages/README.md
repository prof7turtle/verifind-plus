# Frontend Pages Scope (Phase 4 Scope)

This directory contains full page/tab views:

---

## 1. `Dashboard.jsx`
- System overview metrics: Total verified identities, total digital assets minted, recent audit transactions.
- Quick navigation shortcuts based on active wallet role.

---

## 2. `IdentityManagement.jsx`
- Detailed identity dashboard.
- Display of connected user's W3C DID document and cryptographic public keys.
- Admin registration workflow and user listing.

---

## 3. `AssetManagement.jsx`
- Complete digital asset repository view.
- Asset creation modal (uploading document, hashing, generating token URI).
- Transfer interface ensuring destination addresses satisfy on-chain DID registration.

---

## 4. `AuditView.jsx`
- Full-screen forensic and audit verification dashboard for users with `AUDITOR_ROLE` or `ADMIN_ROLE`.
- Real-time event stream powered by backend indexing.
