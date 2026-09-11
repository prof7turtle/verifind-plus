# VeriFind Plus — Live Demonstration Script
## Project: SIH 26125 — Bharat Electronics Limited (BEL)
**Platform**: Blockchain-Based Secure Identity, Access Control & Digital Asset Management  
**Target Duration**: 4 to 5 minutes  
**Presenter Persona**: Lead Blockchain Security Architect  

---

## Pre-Demo Setup Checklist (Presenter)

Before starting the presentation:
1. **Local Hardhat Node**: Running on `http://127.0.0.1:8545` (`npx hardhat node`).
2. **Smart Contracts**: Deployed via `npx hardhat run scripts/deploy.js --network localhost`.
3. **Seed Data**: Populated via `npx hardhat run scripts/seed.js --network localhost`.
4. **Backend Server**: Running on `http://localhost:5000` (`npm run dev`).
5. **Frontend Web UI**: Running on `http://localhost:5173` (`npm run dev`).
6. **MetaMask**:
   - Network configured to **Hardhat Local** (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`).
   - Import **Account #0 (Deployer / Admin)**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
   - Import **Account #1 (SecOps Admin)**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`).
   - Import **Account #2 (Radar Manager)**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`).

---

## Demonstration Timeline (4–5 Minutes)

### 00:00 – 00:30 | Problem Framing & Threat Landscape
**Visual**: Landing Page (`http://localhost:5173/`)  
**Presenter Action**: Hover over the Decrypted Text headline and the cryptographic proof badge.

**Speaking Script**:
> *"Good morning, esteemed jury. In critical defense infrastructure, defense PSUs like Bharat Electronics Limited face a severe vulnerability: centralized identity and access systems. A compromised Active Directory or centralized database grants attackers unilateral privilege escalation, untraceable data tampering, and insider sabotage.*
> 
> *VeriFind Plus addresses SIH 26125 by replacing vulnerable centralized stores with a high-assurance, decentralized security architecture: self-sovereign W3C Decentralized Identifiers, cryptographic smart-contract Role-Based Access Control, ERC-721 defense asset tokenization, and an immutable, zero-tamper audit trail."*

---

### 00:30 – 01:30 | Identity Layer & Live On-Chain RBAC
**Visual**: Click **Connect MetaMask** (Account #0) -> Dashboard (`/dashboard`) -> Identities (`/identities`)  
**Presenter Action**: 
1. Connect MetaMask as Deployer/Admin (`0xf39F...2266`).
2. Show the role badge in the navbar indicating **ADMIN**.
3. Navigate to **Identities** (`/identities`).
4. Point out the 6 seeded enterprise identities across all tiers:
   - `ADMIN`: Primary Deployer and Commander Sharma.
   - `MANAGER`: Dr. P. Nair and R. Kulkarni (promoted from User).
   - `AUDITOR`: V. Raghavan.
   - `USER (Revoked)`: T. Sengupta (deactivated badge highlighted).
5. Click **Register Identity** to show the admin-gated modal and point out direct smart contract write verification.

**Speaking Script**:
> *"Let's connect our hardware-backed admin identity via MetaMask. Notice that the navbar immediately queries our on-chain IdentityRegistry smart contract, recognizing our address and rendering our active ADMIN status.*
> 
> *Navigating to the Identities console, we see our operational directory. Each entity is bound to a cryptographic W3C DID string tied immutably to their Ethereum address. Role management is enforced directly at the EVM bytecode level via OpenZeppelin AccessControl. Notice Field Technician Sengupta: this account was deactivated following an offboarding cycle. The smart contract immediately revoked active status across all platform services."*

---

### 01:30 – 02:30 | Asset Layer: Tokenization & Provenance Transfer
**Visual**: Asset Management (`/assets`)  
**Presenter Action**:
1. Navigate to **Assets** tab.
2. Review the 4 tokenized defense assets:
   - Token #1: *Active Phased Array Radar Calibration Matrix v4.1* (Owner: Dr. P. Nair).
   - Token #2: *Tactical SDR Secure Firmware Build v2.3* (Owner: Dr. P. Nair, transferred from Operator Kulkarni).
   - Token #3: *Zone-4 Digital Access Credential* (Owner: Commander Sharma).
   - Token #4: *ECC Master Encryption Key Bundle* (Owner: T. Sengupta).
3. Click **Mint Digital Asset** modal to show the recipient identity requirement.
4. *(Optional Live Security Boundary Demo)*: Enter an unregistered address (e.g., `0x000000000000000000000000000000000000dEaD`) to demonstrate the contract revert warning: *"Recipient does not have an active identity"*.

**Speaking Script**:
> *"Next, we examine the Digital Asset layer. In defense operations, critical items like radar calibration matrices, firmware builds, and encryption key bundles must have verifiable provenance.*
> 
> *VeriFind Plus tokenizes these assets into ERC-721 smart contracts with content-addressed IPFS metadata hashes. Look at Token #2: this tactical SDR firmware was originally minted to Operator Kulkarni and transferred to Radar Systems Manager Dr. Nair. Unlike standard NFT contracts, our AssetNFT contract strictly enforces an on-chain identity check: assets can only be minted to or received by accounts holding an active identity profile in the IdentityRegistry. Unregistered or deactivated keys are rejected at the EVM level."*

---

### 02:30 – 03:30 | Forensic Blockchain Audit Trail & Inspector
**Visual**: Audit Trail (`/audit`)  
**Presenter Action**:
1. Navigate to **Audit Trail** (`/audit`).
2. Show the chronological event stream indexed directly from on-chain events.
3. Type `0x15d34aaf54267db7d7c367839aaf71a00a2c6a65` in the search bar and click **Search**.
4. Point out the 4 lifecycle events for Operator Kulkarni:
   - `IdentityRegistered` -> `AssetMinted` -> `AssetTransferredWithAudit` -> `RoleGrantedAudit` (Promotion to Manager).
5. Clear search.
6. Click the **Inspect Payload** icon on `AssetTransferredWithAudit` (Block #13) to open the JSON inspector modal.

**Speaking Script**:
> *"Now we arrive at the core assurance requirement: the Forensic Audit Trail. Every single action—identity registration, role elevation, asset minting, ownership transfer, and credential revocation—emits an immutable smart contract event.*
> 
> *Notice our live search: filtering by Operator Kulkarni reveals his complete chronological lifecycle: initial DID registration, receiving the firmware build, handing over the token to Dr. Nair, and subsequent role promotion to Manager.*
> 
> *Opening the cryptographic payload inspector, we see the raw transaction hash, block number, and decoded contract arguments. This forensic trail cannot be erased, rewritten, or backdated by any administrator, providing non-repudiation for military and defense compliance."*

---

### 03:30 – 04:30 | Architectural Close & Defense Enterprise Impact
**Visual**: Telemetry Footer & Architecture Diagram / Landing Page  
**Presenter Action**: Scroll to footer showing Hardhat Node status, contract addresses, and W3C/OpenZeppelin specifications.

**Speaking Script**:
> *"To summarize the engineering behind VeriFind Plus for Bharat Electronics Limited:
> 1. **Zero Centralized Failure Points**: Identities and roles are enforced by EVM smart contracts, not vulnerable databases.
> 2. **Strict Defense Provenance**: Digital defense assets cannot be created or transferred outside verified, authorized personnel.
> 3. **Defense-Grade Immutability**: Even in the off-chain query layer, our MongoDB schema enforces Mongoose immutability hooks, ensuring logs cannot be modified once indexed.
> 
> *VeriFind Plus delivers a battle-tested, production-ready foundation for high-assurance defense electronics and tactical operations. Thank you, and we are ready for your questions."*

---

## Appendix: Seeded Accounts & Asset Reference

### Identity Accounts

| Account # | Persona & Department | Address | Initial Role | Status | DID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#0** | Platform Architect / Primary Deployer | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `ADMIN_ROLE` | **Active** | `did:ethr:0xf39F...2266` |
| **#1** | Commander A. Sharma (SecOps Admin) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `ADMIN_ROLE` | **Active** | `did:ethr:0x7099...79C8` |
| **#2** | Dr. P. Nair (Radar Systems Manager) | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `MANAGER_ROLE` | **Active** | `did:ethr:0x3C44...93BC` |
| **#3** | V. Raghavan (Compliance Inspector) | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `AUDITOR_ROLE` | **Active** | `did:ethr:0x90F7...b906` |
| **#4** | R. Kulkarni (Defense Payload Operator) | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `USER_ROLE` *(Promoted)* | **Active** (`MANAGER`) | `did:ethr:0x15d3...6A65` |
| **#5** | T. Sengupta (Field Technician) | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | `USER_ROLE` *(Revoked)* | **Deactivated** | `did:ethr:0x9965...A4dc` |

### Hardhat Default Private Keys for Quick Wallet Import

| Account | Private Key |
| :--- | :--- |
| **Account #0 (Deployer / Admin)** | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Account #1 (SecOps Admin)** | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Account #2 (Radar Systems Manager)** | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **Account #3 (Auditor)** | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| **Account #4 (Operator -> Manager)** | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |
| **Account #5 (Technician Deactivated)** | `0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba` |

### Tokenized Defense Digital Assets

| Token ID | Asset Label | Initial Recipient | Current Owner | IPFS Metadata Hash |
| :--- | :--- | :--- | :--- | :--- |
| **#1** | BEL Active Phased Array Radar Calibration Matrix v4.1 | Dr. P. Nair (`0x3C44...93BC`) | Dr. P. Nair (`0x3C44...93BC`) | `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi` |
| **#2** | Tactical SDR Secure Firmware Build v2.3 (Signed) | R. Kulkarni (`0x15d3...6A65`) | Dr. P. Nair (`0x3C44...93BC`) *(Transferred)* | `ipfs://bafybeihkoviema7g3gxyt6hel2pti26z2tshcvyv3dmpxe2gnjefy26jdy` |
| **#3** | High-Security Zone-4 Digital Facility Access Credential | Cmdr. Sharma (`0x7099...79C8`) | Cmdr. Sharma (`0x7099...79C8`) | `ipfs://bafybeicg4f6yub4fquz4x5lq7o6vd76uhq3y26nf3efuylqabf3oclgtqy` |
| **#4** | ECC-384 Master Encryption Key Derivation Bundle #09 | T. Sengupta (`0x9965...A4dc`) | T. Sengupta (`0x9965...A4dc`) | `ipfs://bafybeifx3w7yub5fquz4x5lq7o6vd76uhq3y26nf3efuylqabf3oclgtqy` |
