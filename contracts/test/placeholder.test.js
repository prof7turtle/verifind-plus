/**
 * @file placeholder.test.js
 * @description Test suite for SIH 26125 smart contracts.
 * @phase Phase 1 (IdentityRegistry unit tests implemented) & Phase 2 (AssetNFT unit tests placeholder).
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SIH 26125 Smart Contracts Suite", function () {
  describe("IdentityRegistry Contract", function () {
    let identityRegistry;
    let owner;
    let manager;
    let auditor;
    let user1;
    let user2;
    let unauthorized;

    let ADMIN_ROLE;
    let MANAGER_ROLE;
    let AUDITOR_ROLE;
    let USER_ROLE;
    let DEFAULT_ADMIN_ROLE;

    const sampleDid1 = "did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const sampleDid2 = "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";

    beforeEach(async function () {
      [owner, manager, auditor, user1, user2, unauthorized] = await ethers.getSigners();

      const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
      identityRegistry = await IdentityRegistry.deploy();
      await identityRegistry.waitForDeployment();

      ADMIN_ROLE = await identityRegistry.ADMIN_ROLE();
      MANAGER_ROLE = await identityRegistry.MANAGER_ROLE();
      AUDITOR_ROLE = await identityRegistry.AUDITOR_ROLE();
      USER_ROLE = await identityRegistry.USER_ROLE();
      DEFAULT_ADMIN_ROLE = await identityRegistry.DEFAULT_ADMIN_ROLE();
    });

    it("should assign DEFAULT_ADMIN_ROLE and ADMIN_ROLE to deployer on deployment", async function () {
      expect(await identityRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await identityRegistry.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);

      // Other roles should not be assigned to owner by default
      expect(await identityRegistry.hasRole(USER_ROLE, owner.address)).to.equal(false);
      expect(await identityRegistry.hasRole(ADMIN_ROLE, unauthorized.address)).to.equal(false);
    });

    it("should allow admin to register a new identity and emit IdentityRegistered event", async function () {
      const tx = await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(identityRegistry, "IdentityRegistered")
        .withArgs(user1.address, sampleDid1, USER_ROLE, block.timestamp);

      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.did).to.equal(sampleDid1);
      expect(identity.owner).to.equal(user1.address);
      expect(identity.role).to.equal(USER_ROLE);
      expect(identity.isActive).to.equal(true);
      expect(identity.createdAt).to.equal(block.timestamp);

      // Verify didToAddress mapping
      expect(await identityRegistry.didToAddress(sampleDid1)).to.equal(user1.address);

      // Verify AccessControl role granted
      expect(await identityRegistry.hasRole(USER_ROLE, user1.address)).to.equal(true);
      expect(await identityRegistry.hasActiveRole(user1.address, USER_ROLE)).to.equal(true);
    });

    it("should revert if non-admin accounts attempt to call registerIdentity", async function () {
      await expect(
        identityRegistry.connect(unauthorized).registerIdentity(user1.address, sampleDid1, USER_ROLE)
      ).to.be.revertedWithCustomError(identityRegistry, "AccessControlUnauthorizedAccount");
    });

    it("should revert when attempting to register a duplicate DID", async function () {
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);

      await expect(
        identityRegistry.connect(owner).registerIdentity(user2.address, sampleDid1, USER_ROLE)
      ).to.be.revertedWith("DID already registered");
    });

    it("should revert when registering an already active user address", async function () {
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);

      await expect(
        identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid2, MANAGER_ROLE)
      ).to.be.revertedWith("User already has an active identity");
    });

    it("should revert when registering with invalid address or empty DID", async function () {
      await expect(
        identityRegistry.connect(owner).registerIdentity(ethers.ZeroAddress, sampleDid1, USER_ROLE)
      ).to.be.revertedWith("Invalid user address");

      await expect(
        identityRegistry.connect(owner).registerIdentity(user1.address, "", USER_ROLE)
      ).to.be.revertedWith("DID cannot be empty");
    });

    it("should allow admin to updateRole, revoking old role and granting new role with event", async function () {
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);
      expect(await identityRegistry.hasRole(USER_ROLE, user1.address)).to.equal(true);

      const tx = await identityRegistry.connect(owner).updateRole(user1.address, MANAGER_ROLE);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(identityRegistry, "RoleGrantedAudit")
        .withArgs(user1.address, MANAGER_ROLE, owner.address, block.timestamp);

      // Old role must be revoked
      expect(await identityRegistry.hasRole(USER_ROLE, user1.address)).to.equal(false);
      expect(await identityRegistry.hasActiveRole(user1.address, USER_ROLE)).to.equal(false);

      // New role must be active
      expect(await identityRegistry.hasRole(MANAGER_ROLE, user1.address)).to.equal(true);
      expect(await identityRegistry.hasActiveRole(user1.address, MANAGER_ROLE)).to.equal(true);

      const updatedIdentity = await identityRegistry.getIdentity(user1.address);
      expect(updatedIdentity.role).to.equal(MANAGER_ROLE);
    });

    it("should revert updateRole if called by non-admin or for inactive identity", async function () {
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);

      await expect(
        identityRegistry.connect(unauthorized).updateRole(user1.address, MANAGER_ROLE)
      ).to.be.revertedWithCustomError(identityRegistry, "AccessControlUnauthorizedAccount");

      await expect(
        identityRegistry.connect(owner).updateRole(user2.address, MANAGER_ROLE)
      ).to.be.revertedWith("Identity does not exist or is inactive");
    });

    it("should allow admin to deactivateIdentity, setting isActive to false but keeping record queryable", async function () {
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);

      const tx = await identityRegistry.connect(owner).deactivateIdentity(user1.address);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(identityRegistry, "IdentityDeactivated")
        .withArgs(user1.address, block.timestamp);

      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.isActive).to.equal(false);
      expect(identity.did).to.equal(sampleDid1);
      expect(identity.owner).to.equal(user1.address);

      // hasActiveRole should return false when deactivated
      expect(await identityRegistry.hasActiveRole(user1.address, USER_ROLE)).to.equal(false);
    });

    it("should revert deactivateIdentity if called by non-admin or if already inactive", async function () {
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);

      await expect(
        identityRegistry.connect(unauthorized).deactivateIdentity(user1.address)
      ).to.be.revertedWithCustomError(identityRegistry, "AccessControlUnauthorizedAccount");

      await identityRegistry.connect(owner).deactivateIdentity(user1.address);

      await expect(
        identityRegistry.connect(owner).deactivateIdentity(user1.address)
      ).to.be.revertedWith("Identity does not exist or is already inactive");
    });
  });

  describe("AssetNFT Contract", function () {
    it("should only allow authorized roles (ADMIN/MANAGER) to mint assets", async function () {
      // TODO [Phase 2]: Implement role-restricted minting test
      expect(true).to.equal(true);
    });

    it("should only allow asset transfer to registered identities", async function () {
      // TODO [Phase 2]: Implement recipient identity verification test
    });
  });
});
