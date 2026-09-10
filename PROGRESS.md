# Progress Tracker — SIH 26125 Identity/Access/Asset Platform

## Current Phase
Phase 0 — Scaffolding (COMPLETE)

## Completed
- [x] Root config files created (.gitignore, .env.example, README.md)
- [x] contracts/ folder scaffolded (Hardhat config, empty contract skeletons)
- [x] backend/ folder scaffolded (Express skeleton, Mongoose model stubs)
- [x] frontend/ folder scaffolded (Vite React skeleton)
- [x] data/ sample JSON files created
- [x] docs/ notes created

## Tech Stack (fixed — do not change)
- Contracts: Solidity, Hardhat, OpenZeppelin
- Backend: Node.js, Express, MongoDB via Mongoose
- Frontend: React + Vite (JavaScript), ethers.js
- No Next.js, no Docker for prototype phase

## Next Phase To Execute
Phase 1 — Smart Contracts Core
Scope: Implement IdentityRegistry.sol (register identity with DID string + role,
using OpenZeppelin AccessControl for roles: ADMIN_ROLE, MANAGER_ROLE, AUDITOR_ROLE, USER_ROLE).
Write unit tests. Deploy locally via Hardhat script. Do NOT start backend or frontend logic yet.

## Notes / Decisions Log
- 2026-09-10: Phase 0 scaffolding initialized. Folder structure, configs, contract skeletons, backend stubs, frontend React/Vite shell, sample data, and documentation created.
- 2026-09-10: Confirmed lightweight prototype constraints (pure React + Vite JS, Express + Mongoose, Hardhat local chain).
