# Data Directory & Seed Specifications

This folder holds static reference data, mock schemas, and seed fixtures.

---

## 1. Static Datasets (Included in Phase 0)
- `sample-did-documents.json`: Example W3C Decentralized Identifier documents (`did:ethr` and `did:key` schemas).
- `sample-roles.json`: Role definition matrix (`ADMIN`, `MANAGER`, `AUDITOR`, `USER`) matching OpenZeppelin `AccessControl` keccak256 hashes and permission scopes.

---

## 2. Seed Data for Future Phase (Phase 5 Scope)
In **Phase 5 (Integration & Demo Data)**, automated seeding scripts will populate:
1. **Initial Identities**:
   - 1 Admin account (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` - Hardhat Account #0)
   - 2 Manager accounts (BEL Department Heads)
   - 1 Auditor account (BEL Compliance Officer)
   - 5 Standard User accounts (Defense personnel/engineers)
2. **Mock Digital Assets**:
   - Defense equipment maintenance passports
   - Secure communication cryptographic certificates
   - Classified engineering schematics with mock IPFS hashes (`Qm...`)
3. **Historical Audit Logs**:
   - Seeded lifecycle transactions demonstrating identity registration -> role upgrade -> asset minting -> asset transfer -> audit inspection.
