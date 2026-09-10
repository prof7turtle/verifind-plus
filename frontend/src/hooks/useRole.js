import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getIdentityContract, ROLE_HASHES } from "@/utils/contractConfig";
import { useWallet } from "./useWallet";

export function useRole() {
  const { account, provider } = useWallet();
  const [role, setRole] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [did, setDid] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRole = useCallback(async () => {
    if (!account || !provider) {
      setRole(null);
      setIsActive(false);
      setDid("");
      return;
    }

    setLoading(true);
    try {
      const identityContract = getIdentityContract(provider);

      // Check on-chain identity record
      const identity = await identityContract.getIdentity(account);
      const isRegisteredActive = identity && identity.isActive;

      // Check if account has ADMIN_ROLE directly via AccessControl
      const hasAdminRole = await identityContract.hasRole(ROLE_HASHES.ADMIN_ROLE, account);
      const hasDefaultAdmin = await identityContract.hasRole(ethers.ZeroHash, account);

      let detectedRole = "USER";

      if (hasAdminRole || hasDefaultAdmin || identity.role === ROLE_HASHES.ADMIN_ROLE) {
        detectedRole = "ADMIN";
      } else if (identity.role === ROLE_HASHES.MANAGER_ROLE) {
        detectedRole = "MANAGER";
      } else if (identity.role === ROLE_HASHES.AUDITOR_ROLE) {
        detectedRole = "AUDITOR";
      } else if (identity.role === ROLE_HASHES.USER_ROLE) {
        detectedRole = "USER";
      }

      setRole(detectedRole);
      setIsActive(isRegisteredActive || hasAdminRole || hasDefaultAdmin);
      setDid(identity?.did || "");
    } catch (error) {
      console.warn("[useRole] Could not fetch role from contract:", error.message);
      setRole("USER");
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    did,
    isActive,
    loading,
    isAdmin: role === "ADMIN",
    isManager: role === "MANAGER",
    isAuditor: role === "AUDITOR",
    isUser: role === "USER",
    refetchRole: fetchRole,
  };
}
