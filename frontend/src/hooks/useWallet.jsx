import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { TARGET_CHAIN_ID, TARGET_NETWORK_NAME } from "@/utils/contractConfig";
import { useToast } from "@/components/ui/toast";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const toast = useToast();

  const isWrongNetwork = chainId !== null && Number(chainId) !== TARGET_CHAIN_ID;

  // Initialize provider and check already-connected accounts
  const initWallet = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      try {
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));

        const accounts = await browserProvider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          const activeAccount = accounts[0];
          setAccount(activeAccount);
          const activeSigner = await browserProvider.getSigner();
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
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (provider) {
            const newSigner = await provider.getSigner();
            setSigner(newSigner);
          }
        } else {
          setAccount(null);
          setSigner(null);
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
  }, [initWallet, provider]);

  const connect = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask Not Detected", "Please install MetaMask browser extension to connect.");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const activeAccount = accounts[0];
      const activeSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setAccount(activeAccount);
      setSigner(activeSigner);
      setChainId(Number(network.chainId));

      toast.success("Wallet Connected", `Connected as ${activeAccount.slice(0, 6)}...${activeAccount.slice(-4)}`);
    } catch (err) {
      toast.error("Connection Failed", err.message || "User rejected connection request");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
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
      // Chain not added, attempt to add it
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
        } catch (addError) {
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
        isConnecting,
        isWrongNetwork,
        connect,
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
