import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Fast, resilient transaction receipt resolver.
 * Bypasses MetaMask's slow internal block event polling on local networks
 * by querying JSON-RPC directly and racing with tx.wait(1).
 */
export async function waitForTxReceipt(tx, provider, timeoutMs = 8000) {
  if (!tx) return null;
  const txHash = typeof tx === "string" ? tx : tx.hash;
  if (!txHash) return null;

  const startTime = Date.now();
  const directRpc = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  while (Date.now() - startTime < timeoutMs) {
    // 1. Check direct JSON-RPC node (Hardhat automines instantaneously)
    try {
      const receipt = await directRpc.getTransactionReceipt(txHash);
      if (receipt && receipt.blockNumber) {
        return receipt;
      }
    } catch {
      // Continue polling
    }

    // 2. Check provider
    if (provider && typeof provider.getTransactionReceipt === "function") {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt && receipt.blockNumber) {
          return receipt;
        }
      } catch {
        // Continue
      }
    }

    // 3. Race with short tx.wait
    if (typeof tx.wait === "function") {
      try {
        const receipt = await Promise.race([
          tx.wait(1),
          new Promise((_, reject) => setTimeout(() => reject(new Error("poll_tick")), 500)),
        ]);
        if (receipt) return receipt;
      } catch {
        // Continue
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Fallback to standard tx.wait
  if (typeof tx.wait === "function") {
    try {
      return await tx.wait(1);
    } catch {
      return null;
    }
  }

  return null;
}
