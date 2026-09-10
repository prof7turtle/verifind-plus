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
    let identityRegistry;
    let assetNFT;
    let owner;
    let minter;
    let admin;
    let user1;
    let user2;
    let unregisteredUser;

    let DEFAULT_ADMIN_ROLE;
    let ADMIN_ROLE;
    let MINTER_ROLE;

    const sampleDid1 = "did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const sampleDid2 = "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";
    const sampleMetadataHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
    const sampleMetadataHash2 = "bafybeicg2gggnxtwhvkvsap7tvkzg5x6f45o5s7g7u4nugf2hsmzrqzspq";

    beforeEach(async function () {
      [owner, minter, admin, user1, user2, unregisteredUser] = await ethers.getSigners();

      // Deploy IdentityRegistry first
      const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
      identityRegistry = await IdentityRegistry.deploy();
      await identityRegistry.waitForDeployment();

      // Register identities for user1 and user2
      const USER_ROLE = await identityRegistry.USER_ROLE();
      await identityRegistry.connect(owner).registerIdentity(user1.address, sampleDid1, USER_ROLE);
      await identityRegistry.connect(owner).registerIdentity(user2.address, sampleDid2, USER_ROLE);

      // Deploy AssetNFT linked to IdentityRegistry
      const AssetNFT = await ethers.getContractFactory("AssetNFT");
      assetNFT = await AssetNFT.deploy(await identityRegistry.getAddress());
      await assetNFT.waitForDeployment();

      DEFAULT_ADMIN_ROLE = await assetNFT.DEFAULT_ADMIN_ROLE();
      ADMIN_ROLE = await assetNFT.ADMIN_ROLE();
      MINTER_ROLE = await assetNFT.MINTER_ROLE();
    });

    it("should assign DEFAULT_ADMIN_ROLE, MINTER_ROLE, and ADMIN_ROLE to deployer on deployment", async function () {
      expect(await assetNFT.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await assetNFT.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await assetNFT.hasRole(MINTER_ROLE, owner.address)).to.equal(true);

      expect(await assetNFT.hasRole(MINTER_ROLE, unregisteredUser.address)).to.equal(false);
      expect(await assetNFT.hasRole(ADMIN_ROLE, unregisteredUser.address)).to.equal(false);
      expect(await assetNFT.identityRegistry()).to.equal(await identityRegistry.getAddress());
    });

    it("should revert minting to an address WITHOUT a registered active identity in IdentityRegistry", async function () {
      await expect(
        assetNFT.connect(owner).mintAsset(unregisteredUser.address, sampleMetadataHash)
      ).to.be.revertedWith("Recipient has no active identity");

      // Deactivated user should also revert
      await identityRegistry.connect(owner).deactivateIdentity(user1.address);
      await expect(
        assetNFT.connect(owner).mintAsset(user1.address, sampleMetadataHash)
      ).to.be.revertedWith("Recipient has no active identity");
    });

    it("should succeed minting to an address WITH an active identity, incrementing token ID and emitting AssetMinted", async function () {
      const tx1 = await assetNFT.connect(owner).mintAsset(user1.address, sampleMetadataHash);
      const receipt1 = await tx1.wait();
      const block1 = await ethers.provider.getBlock(receipt1.blockNumber);

      await expect(tx1)
        .to.emit(assetNFT, "AssetMinted")
        .withArgs(1, user1.address, sampleMetadataHash, owner.address, block1.timestamp);

      expect(await assetNFT.ownerOf(1)).to.equal(user1.address);
      expect(await assetNFT.assetMetadataHash(1)).to.equal(sampleMetadataHash);
      expect(await assetNFT.mintedAt(1)).to.equal(block1.timestamp);

      // Second mint increments token ID to 2
      const tx2 = await assetNFT.connect(owner).mintAsset(user2.address, sampleMetadataHash2);
      const receipt2 = await tx2.wait();
      const block2 = await ethers.provider.getBlock(receipt2.blockNumber);

      await expect(tx2)
        .to.emit(assetNFT, "AssetMinted")
        .withArgs(2, user2.address, sampleMetadataHash2, owner.address, block2.timestamp);

      expect(await assetNFT.ownerOf(2)).to.equal(user2.address);
      expect(await assetNFT.assetMetadataHash(2)).to.equal(sampleMetadataHash2);
    });

    it("should revert if non-minter accounts attempt to call mintAsset", async function () {
      await expect(
        assetNFT.connect(unregisteredUser).mintAsset(user1.address, sampleMetadataHash)
      ).to.be.revertedWithCustomError(assetNFT, "AccessControlUnauthorizedAccount");
    });

    it("should emit AssetTransferredWithAudit on token transfer between addresses", async function () {
      await assetNFT.connect(owner).mintAsset(user1.address, sampleMetadataHash);

      const tx = await assetNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(assetNFT, "AssetTransferredWithAudit")
        .withArgs(1, user1.address, user2.address, block.timestamp);

      expect(await assetNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("should allow admin to decommissionAsset, burning token and emitting AssetDecommissioned", async function () {
      await assetNFT.connect(owner).mintAsset(user1.address, sampleMetadataHash);

      const tx = await assetNFT.connect(owner).decommissionAsset(1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(assetNFT, "AssetDecommissioned")
        .withArgs(1, owner.address, block.timestamp);

      // ownerOf should revert for burned token
      await expect(assetNFT.ownerOf(1)).to.be.revertedWithCustomError(
        assetNFT,
        "ERC721NonexistentToken"
      );
    });

    it("should revert decommissionAsset if called by non-admin accounts", async function () {
      await assetNFT.connect(owner).mintAsset(user1.address, sampleMetadataHash);

      await expect(
        assetNFT.connect(unregisteredUser).decommissionAsset(1)
      ).to.be.revertedWithCustomError(assetNFT, "AccessControlUnauthorizedAccount");
    });

    it("should return correct asset details via getAssetInfo and revert for nonexistent tokens", async function () {
      const tx = await assetNFT.connect(owner).mintAsset(user1.address, sampleMetadataHash);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const info = await assetNFT.getAssetInfo(1);
      expect(info.owner).to.equal(user1.address);
      expect(info.metadataHash).to.equal(sampleMetadataHash);
      expect(info.timestamp).to.equal(block.timestamp);

      await expect(assetNFT.getAssetInfo(999)).to.be.revertedWithCustomError(
        assetNFT,
        "ERC721NonexistentToken"
      );
    });
  });
});
