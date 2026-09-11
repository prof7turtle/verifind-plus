import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { TARGET_CHAIN_ID, TARGET_NETWORK_NAME } from "@/utils/contractConfig";
import { useToast } from "@/components/ui/toast";
import { getPersona, KNOWN_PERSONAS } from "@/utils/personas";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const toast = useToast();

  const isWrongNetwork = chainId !== null && Number(chainId) !== TARGET_CHAIN_ID;
  const persona = useMemo(() => getPersona(account), [account]);

  // Create stable base provider for RPC
  const getRpcProvider = useCallback(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  }, []);

  // Check already-connected accounts (only if user hasn't explicitly disconnected)
  const initWallet = useCallback(async () => {
    const explicitlyDisconnected = sessionStorage.getItem("verifind_disconnected") === "true";
    if (explicitlyDisconnected) {
      return;
    }

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));

        const savedAccount = sessionStorage.getItem("verifind_active_account");
        const accounts = await browserProvider.send("eth_accounts", []);

        if (accounts && accounts.length > 0) {
          const activeAccount = savedAccount && accounts.some((a) => a.toLowerCase() === savedAccount.toLowerCase())
            ? savedAccount
            : accounts[0];
          setAccount(activeAccount);
          const activeSigner = await browserProvider.getSigner(activeAccount).catch(() => browserProvider.getSigner());
          setSigner(activeSigner);
        }
      } catch (err) {
        console.warn("[Wallet] Init error:", err.message);
      }
    }
  }, []);

  useEffect(() => {
    initWallet();

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (sessionStorage.getItem("verifind_disconnected") === "true") return;

        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          sessionStorage.setItem("verifind_active_account", newAccount);

          try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);
            const newSigner = await browserProvider.getSigner(newAccount);
            setSigner(newSigner);
          } catch (e) {
            console.warn("[Wallet] Signer update notice:", e.message);
          }
        } else {
          setAccount(null);
          setSigner(null);
          sessionStorage.removeItem("verifind_active_account");
        }
      };

      const handleChainChanged = (newChainId) => {
        setChainId(parseInt(newChainId, 16));
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [initWallet]); // Notice: provider removed to prevent infinite re-render loop

  // Connect via MetaMask with optional native account selection popup
  const connectMetaMask = async (forceAccountPicker = false) => {
    if (!window.ethereum) {
      toast.error("MetaMask Not Detected", "Please install MetaMask browser extension to connect.");
      return;
    }

    setIsConnecting(true);
    sessionStorage.removeItem("verifind_disconnected");

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      let accounts = [];

      // Force MetaMask account picker modal if requested
      if (forceAccountPicker) {
        try {
          const permissions = await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
          const accountsPermission = permissions.find((p) => p.parentCapability === "eth_accounts");
          if (accountsPermission) {
            accounts = await browserProvider.send("eth_accounts", []);
          }
        } catch (permErr) {
          console.warn("[Wallet] Request permissions skipped or cancelled:", permErr.message);
        }
      }

      if (!accounts || accounts.length === 0) {
        accounts = await browserProvider.send("eth_requestAccounts", []);
      }

      const activeAccount = accounts[0];
      const activeSigner = await browserProvider.getSigner(activeAccount);
      const network = await browserProvider.getNetwork();

      setAccount(activeAccount);
      setSigner(activeSigner);
      setChainId(Number(network.chainId));
      sessionStorage.setItem("verifind_active_account", activeAccount);
      setIsConnectModalOpen(false);

      const targetPersona = getPersona(activeAccount);
      toast.success(
        "Wallet Connected",
        `Connected as ${targetPersona?.name || activeAccount.slice(0, 6) + "..." + activeAccount.slice(-4)} (${targetPersona?.role || "USER"})`
      );
    } catch (err) {
      toast.error("Connection Failed", err.message || "User rejected connection request");
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch or connect directly as a known persona (for demo and instant switching)
  const connectPersona = async (targetAddress) => {
    setIsConnecting(true);
    sessionStorage.removeItem("verifind_disconnected");
    sessionStorage.setItem("verifind_active_account", targetAddress);

    try {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));

        // Attempt to get signer for target account if available in MetaMask
        try {
          const activeSigner = await browserProvider.getSigner(targetAddress);
          setSigner(activeSigner);
        } catch {
          // If not in MetaMask, get default signer
          const fallbackSigner = await browserProvider.getSigner().catch(() => null);
          setSigner(fallbackSigner);
        }
      } else {
        const rpcProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        setProvider(rpcProvider);
        setChainId(31337);
        const rpcSigner = await rpcProvider.getSigner(targetAddress).catch(() => null);
        setSigner(rpcSigner);
      }

      setAccount(targetAddress);
      setIsConnectModalOpen(false);

      const targetPersona = getPersona(targetAddress);
      toast.success(
        "Role Persona Activated",
        `Switched to ${targetPersona?.name} (${targetPersona?.role})`
      );
    } catch (err) {
      toast.error("Role Switch Failed", err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Instant disconnect
  const disconnect = () => {
    sessionStorage.setItem("verifind_disconnected", "true");
    sessionStorage.removeItem("verifind_active_account");
    setAccount(null);
    setSigner(null);
    toast.info("Wallet Disconnected", "Your session has been disconnected.");
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + TARGET_CHAIN_ID.toString(16) }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + TARGET_CHAIN_ID.toString(16),
                chainName: TARGET_NETWORK_NAME,
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "Hardhat ETH", symbol: "ETH", decimals: 18 },
              },
            ],
          });
        } catch {
          toast.error("Network Error", "Could not add Hardhat local network to MetaMask.");
        }
      } else {
        toast.error("Network Switch Failed", switchError.message);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        persona,
        isConnecting,
        isWrongNetwork,
        isConnectModalOpen,
        setIsConnectModalOpen,
        connect: () => setIsConnectModalOpen(true),
        connectMetaMask,
        connectPersona,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
