// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IdentityRegistry
 * @notice Manages Decentralized Identifiers (DIDs) and Role-Based Access Control (RBAC)
 *         for the VeriFind Plus platform (SIH 26125, Bharat Electronics Limited).
 * @dev Inherits from OpenZeppelin AccessControl. Implements decentralized identity
 *      registration, role assignments, status deactivation, and event-based audit logging.
 */
contract IdentityRegistry is AccessControl {
    /// @notice Role identifiers mapped via keccak256 hashes
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    /// @notice Represents a user's registered identity on-chain
    struct Identity {
        string did;
        address owner;
        bytes32 role;
        uint256 createdAt;
        bool isActive;
    }

    /// @notice Maps user Ethereum address to their Identity profile
    mapping(address => Identity) public identities;

    /// @notice Maps DID string to the associated Ethereum address to prevent duplicate registrations
    mapping(string => address) public didToAddress;

    /// @notice Emitted when a new identity is registered on-chain
    event IdentityRegistered(
        address indexed user,
        string did,
        bytes32 role,
        uint256 timestamp
    );

    /// @notice Emitted when an identity is deactivated
    event IdentityDeactivated(
        address indexed user,
        uint256 timestamp
    );

    /// @notice Emitted when an identity role is changed or reassigned
    event RoleGrantedAudit(
        address indexed user,
        bytes32 role,
        address indexed grantedBy,
        uint256 timestamp
    );

    /**
     * @notice Initializes contract, granting DEFAULT_ADMIN_ROLE and ADMIN_ROLE to the deployer.
     * @dev Sets up role administration hierarchy where ADMIN_ROLE can manage operational roles.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MANAGER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(AUDITOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(USER_ROLE, ADMIN_ROLE);
    }

    /**
     * @notice Registers a new decentralized identity with an initial role.
     * @dev Restricted to callers with ADMIN_ROLE.
     *      Reverts if address is zero, DID string is empty, DID is already registered,
     *      or the user address already has an active identity.
     * @param user The Ethereum address of the user.
     * @param did The W3C-compliant DID identifier string.
     * @param role The initial RBAC role to assign (e.g., ADMIN_ROLE, MANAGER_ROLE, USER_ROLE).
     */
    function registerIdentity(
        address user,
        string calldata did,
        bytes32 role
    ) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Invalid user address");
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didToAddress[did] == address(0), "DID already registered");
        require(!identities[user].isActive, "User already has an active identity");

        identities[user] = Identity({
            did: did,
            owner: user,
            role: role,
            createdAt: block.timestamp,
            isActive: true
        });

        didToAddress[did] = user;

        _grantRole(role, user);

        emit IdentityRegistered(user, did, role, block.timestamp);
    }

    /**
     * @notice Updates the role of an active registered identity.
     * @dev Restricted to callers with ADMIN_ROLE. Revokes the user's previous role,
     *      grants the new role, updates the struct, and emits RoleGrantedAudit.
     * @param user The Ethereum address of the identity to update.
     * @param newRole The new role to assign.
     */
    function updateRole(
        address user,
        bytes32 newRole
    ) external onlyRole(ADMIN_ROLE) {
        require(identities[user].isActive, "Identity does not exist or is inactive");

        bytes32 oldRole = identities[user].role;
        _revokeRole(oldRole, user);
        _grantRole(newRole, user);

        identities[user].role = newRole;

        emit RoleGrantedAudit(user, newRole, msg.sender, block.timestamp);
    }

    /**
     * @notice Deactivates an existing registered identity.
     * @dev Restricted to callers with ADMIN_ROLE. Sets isActive to false and emits IdentityDeactivated.
     *      Preserves the stored Identity record for audit trails.
     * @param user The Ethereum address of the identity to deactivate.
     */
    function deactivateIdentity(address user) external onlyRole(ADMIN_ROLE) {
        require(identities[user].isActive, "Identity does not exist or is already inactive");

        identities[user].isActive = false;

        emit IdentityDeactivated(user, block.timestamp);
    }

    /**
     * @notice Retrieves the full Identity profile for a given user address.
     * @dev Public view function accessible by anyone.
     * @param user The Ethereum address to query.
     * @return Identity struct representing the user profile.
     */
    function getIdentity(address user) external view returns (Identity memory) {
        return identities[user];
    }

    /**
     * @notice Checks whether an address holds a specified role and possesses an active identity.
     * @dev Convenience view combining AccessControl's hasRole() check with identities[user].isActive.
     * @param user The Ethereum address to inspect.
     * @param role The role identifier to verify.
     * @return True if user holds the role and their identity is active, false otherwise.
     */
    function hasActiveRole(address user, bytes32 role) public view returns (bool) {
        return hasRole(role, user) && identities[user].isActive;
    }
}
