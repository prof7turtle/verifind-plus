# Problem Statement — SIH 26125

## Problem Title
**Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management**

## Organization
**Bharat Electronics Limited (BEL)**

## Category
**Software / Blockchain / Cybersecurity**

---

## Background & Description
In modern defense, aerospace, and high-security enterprise environments, managing identity, controlling access to critical assets, and tracking digital asset lifecycles remain challenging problems when reliant on centralized authorities. Centralized systems represent single points of failure and are susceptible to insider threats, unauthorized privilege escalation, and untraceable data tampering.

Bharat Electronics Limited (BEL) requires a blockchain-based platform that guarantees:
1. **Decentralized Identity (DID) Verification**: Eliminating single points of compromise through self-sovereign cryptographic identities.
2. **Robust Access Control (RBAC)**: Fine-grained, on-chain role enforcement preventing unauthorized manipulation of sensitive parameters.
3. **Digital Asset Management**: Lifecycle management of digital assets (schematics, equipment records, defense supplies) using tokenized representations (ERC-721) with provenance tracking.
4. **Verifiable Auditability**: Tamper-evident, chronological logging of all administrative actions, asset transfers, and privilege modifications.

---

## Objectives
- Develop decentralized smart contracts for Identity and Role Management utilizing OpenZeppelin standards.
- Develop an ERC-721 smart contract for tokenizing digital assets with strict ownership transfer validation.
- Implement an event-driven indexing architecture syncing on-chain states to a scalable query layer.
- Deliver an intuitive, role-gated web dashboard enabling administrators, managers, auditors, and regular participants to interact seamlessly.
- Provide end-to-end auditability where every critical operation is anchored cryptographically on a verifiable ledger.
