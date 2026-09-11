import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { getIdentityContract, ROLE_HASHES } from "@/utils/contractConfig";
import { getPersona } from "@/utils/personas";
import { useWallet } from "./useWallet";

export function useRole() {
  const { account, provider } = useWallet();

  // Instant synchronous lookup from personas mapping
  const initialPersona = useMemo(() => getPersona(account), [account]);

  const [role, setRole] = useState(initialPersona?.role || null);
  const [isActive, setIsActive] = useState(initialPersona ? !initialPersona.deactivated : false);
  const [did, setDid] = useState(account ? `did:ethr:${account}` : "");
  const [loading, setLoading] = useState(false);

  // Synchronize state immediately when account changes
  useEffect(() => {
    if (account) {
      const p = getPersona(account);
      setRole(p?.role || "USER");
      setIsActive(p ? !p.deactivated : true);
      setDid(`did:ethr:${account}`);
    } else {
      setRole(null);
      setIsActive(false);
      setDid("");
    }
  }, [account]);

  const fetchRole = useCallback(async () => {
    if (!account || !provider) {
      return;
    }

    setLoading(true);
    try {
      const identityContract = getIdentityContract(provider);

      // Query on-chain status in parallel for maximum speed
      const [identity, hasAdminRole, hasDefaultAdmin] = await Promise.all([
        identityContract.getIdentity(account).catch(() => null),
        identityContract.hasRole(ROLE_HASHES.ADMIN_ROLE, account).catch(() => false),
        identityContract.hasRole(ethers.ZeroHash, account).catch(() => false),
      ]);

      const isRegisteredActive = identity && identity.isActive;

      let detectedRole = "USER";

      if (hasAdminRole || hasDefaultAdmin || (identity && identity.role === ROLE_HASHES.ADMIN_ROLE)) {
        detectedRole = "ADMIN";
      } else if (identity && identity.role === ROLE_HASHES.MANAGER_ROLE) {
        detectedRole = "MANAGER";
      } else if (identity && identity.role === ROLE_HASHES.AUDITOR_ROLE) {
        detectedRole = "AUDITOR";
      } else if (identity && identity.role === ROLE_HASHES.USER_ROLE) {
        detectedRole = "USER";
      } else {
        // Fallback to persona definition if contract call returns default
        const p = getPersona(account);
        detectedRole = p?.role || "USER";
      }

      setRole(detectedRole);
      setIsActive(
        Boolean(
          isRegisteredActive ||
            hasAdminRole ||
            hasDefaultAdmin ||
            (identity && identity.did && identity.isActive)
        )
      );
      if (identity?.did) {
        setDid(identity.did);
      }
    } catch (error) {
      console.warn("[useRole] On-chain verification notice:", error.message);
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
