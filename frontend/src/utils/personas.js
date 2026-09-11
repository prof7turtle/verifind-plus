/**
 * @file personas.js
 * @description Known accounts, roles, and department personas for VeriFind Plus (SIH 26125).
 *              Enables instant 0ms recognition in the UI and quick role switching.
 */

export const KNOWN_PERSONAS = {
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": {
    name: "Deployer / Lead Architect",
    shortName: "Lead Architect",
    role: "ADMIN",
    title: "Primary Admin & Minter",
    department: "System Architecture",
    badgeVariant: "admin",
    description: "Full administrative authority to register identities, manage RBAC, and mint assets.",
  },
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8": {
    name: "Commander A. Sharma",
    shortName: "Cmdr. Sharma",
    role: "ADMIN",
    title: "SecOps Administrator",
    department: "Security Operations",
    badgeVariant: "admin",
    description: "Authorised to register defense personnel identities and decommission compromised assets.",
  },
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc": {
    name: "Dr. P. Nair",
    shortName: "Dr. P. Nair",
    role: "MANAGER",
    title: "Radar Systems Manager",
    department: "Radar & Avionics",
    badgeVariant: "manager",
    description: "Can mint defense digital assets and receive equipment handovers.",
  },
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906": {
    name: "V. Raghavan",
    shortName: "V. Raghavan",
    role: "AUDITOR",
    title: "Compliance & Audit Inspector",
    department: "Forensic Quality & Audit",
    badgeVariant: "auditor",
    description: "Read-only access to immutable blockchain logs and tamper inspection.",
  },
  "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65": {
    name: "R. Kulkarni",
    shortName: "R. Kulkarni",
    role: "MANAGER",
    title: "Defense Payload Operator",
    department: "Tactical Payload",
    badgeVariant: "manager",
    promoted: true,
    description: "Promoted to Manager. Can hold and transfer digital firmware assets.",
  },
  "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc": {
    name: "T. Sengupta",
    shortName: "T. Sengupta",
    role: "USER",
    title: "Field Technician (Revoked)",
    department: "Field Maintenance",
    badgeVariant: "user",
    deactivated: true,
    description: "Identity deactivated following credential cycle offboarding.",
  },
};

export const SEEDED_PERSONAS_LIST = Object.entries(KNOWN_PERSONAS).map(([address, data]) => ({
  address,
  ...data,
}));

export function getPersona(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  if (KNOWN_PERSONAS[lower]) {
    return {
      address: lower,
      ...KNOWN_PERSONAS[lower],
    };
  }
  return {
    address: lower,
    name: `User ${lower.slice(0, 6)}...${lower.slice(-4)}`,
    shortName: `${lower.slice(0, 6)}...`,
    role: "USER",
    title: "Connected Participant",
    department: "External",
    badgeVariant: "user",
    description: "Standard Web3 identity connected via MetaMask.",
  };
}
