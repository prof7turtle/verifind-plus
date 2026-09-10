// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IdentityRegistry.sol";

/**
 * @title AssetNFT
 * @notice Manages digital assets as ERC-721 tokens tied to decentralized identities and RBAC
 *         for the VeriFind Plus platform (SIH 26125, Bharat Electronics Limited).
 * @dev Inherits from OpenZeppelin ERC721 and AccessControl.
 *      Enforces that token recipients possess verified, active identities in IdentityRegistry.
 *      Includes tamper-proof audit trail event logs on mint, transfer, and decommissioning.
 */
contract AssetNFT is ERC721, AccessControl {
    /// @notice Role identifiers
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Reference to the deployed IdentityRegistry contract
    IdentityRegistry public immutable identityRegistry;

    /// @notice Counter for token IDs starting at 1
    uint256 private _nextTokenId = 1;

    /// @notice Maps token ID to off-chain document / metadata hash (e.g., IPFS CID or SHA-256)
    mapping(uint256 => string) public assetMetadataHash;

    /// @notice Maps token ID to creation timestamp
    mapping(uint256 => uint256) public mintedAt;

    /// @notice Emitted when a new digital asset token is minted
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string metadataHash,
        address indexed mintedBy,
        uint256 timestamp
    );

    /// @notice Emitted when an existing asset token is transferred between accounts
    event AssetTransferredWithAudit(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    /// @notice Emitted when an asset token is decommissioned (burned)
    event AssetDecommissioned(
        uint256 indexed tokenId,
        address indexed decommissionedBy,
        uint256 timestamp
    );

    /**
     * @notice Initializes the AssetNFT contract.
     * @param identityRegistryAddress The address of the deployed IdentityRegistry contract.
     */
    constructor(address identityRegistryAddress) ERC721("VeriFind Plus Asset", "VFPA") {
        require(identityRegistryAddress != address(0), "Invalid IdentityRegistry address");
        identityRegistry = IdentityRegistry(identityRegistryAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mints a new digital asset token to a verified recipient.
     * @dev Restricted to callers with MINTER_ROLE.
     *      Verifies that recipient has an active identity profile in IdentityRegistry.
     * @param to The recipient address holding an active identity.
     * @param metadataHash The IPFS CID or cryptographic hash representing the digital asset.
     * @return tokenId The ID of the newly minted token.
     */
    function mintAsset(
        address to,
        string calldata metadataHash
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Invalid recipient address");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");
        require(identityRegistry.getIdentity(to).isActive, "Recipient has no active identity");

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);

        assetMetadataHash[tokenId] = metadataHash;
        mintedAt[tokenId] = block.timestamp;

        emit AssetMinted(tokenId, to, metadataHash, msg.sender, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Decommissions and burns a digital asset token.
     * @dev Restricted to callers with ADMIN_ROLE. Burns the token and emits AssetDecommissioned.
     * @param tokenId The token ID to decommission.
     */
    function decommissionAsset(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        _burn(tokenId);
        emit AssetDecommissioned(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieves detailed asset information.
     * @dev Reverts if the token does not exist.
     * @param tokenId The token ID to query.
     * @return owner The current owner address of the token.
     * @return metadataHash The off-chain document / metadata hash.
     * @return timestamp The block timestamp when the token was minted.
     */
    function getAssetInfo(
        uint256 tokenId
    ) external view returns (address owner, string memory metadataHash, uint256 timestamp) {
        owner = ownerOf(tokenId);
        metadataHash = assetMetadataHash[tokenId];
        timestamp = mintedAt[tokenId];
    }

    /**
     * @notice OpenZeppelin v5 ERC721 update hook.
     * @dev Overrides `_update` to emit `AssetTransferredWithAudit` on peer-to-peer transfers.
     *      Ignores mints (from == address(0)) and burns (to == address(0)) to avoid duplicate events.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0)) {
            emit AssetTransferredWithAudit(tokenId, from, to, block.timestamp);
        }

        return from;
    }

    /**
     * @notice ERC-165 interface detection supporting both ERC721 and AccessControl.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
