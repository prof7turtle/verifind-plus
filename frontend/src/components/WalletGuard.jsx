import React from "react";
import { Wallet, AlertTriangle, ShieldAlert } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function WalletGuard({ children, requiredRole = null }) {
  const { account, isConnecting, isWrongNetwork, connect, switchNetwork } = useWallet();

  if (!account) {
    return (
      <div className="mx-auto max-w-lg mt-20 px-4">
        <Card className="border-neutral-200 bg-white text-center py-8 shadow-sm">
          <CardHeader className="items-center pb-2">
            <div className="h-12 w-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 mb-3">
              <Wallet className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl text-neutral-950">Authentication Required</CardTitle>
            <CardDescription className="text-neutral-500 max-w-sm mt-1">
              Connect your authorized Web3 wallet (MetaMask) to access the VeriFind Plus security console.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2 px-6"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="mx-auto max-w-lg mt-20 px-4">
        <Card className="border-amber-200 bg-white text-center py-8 shadow-sm">
          <CardHeader className="items-center pb-2">
            <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl text-neutral-950">Unsupported Network</CardTitle>
            <CardDescription className="text-neutral-500 max-w-sm mt-1">
              This deployment is configured for Hardhat Local Network (Chain ID: 31337). Please switch your wallet network to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <Button
              onClick={switchNetwork}
              className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2 px-6"
            >
              <span>Switch to Hardhat (31337)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
