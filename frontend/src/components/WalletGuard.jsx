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
        <Card className="border-slate-800 bg-slate-900/80 text-center py-8">
          <CardHeader className="items-center pb-2">
            <div className="h-12 w-12 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
              <Wallet className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription className="text-slate-400 max-w-sm mt-1">
              Connect your authorized Web3 wallet (MetaMask) to access the VeriFind Plus security console.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="bg-sky-600 hover:bg-sky-500 text-white gap-2 px-6"
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
        <Card className="border-amber-500/30 bg-slate-900/90 text-center py-8">
          <CardHeader className="items-center pb-2">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl text-amber-300">Unsupported Network</CardTitle>
            <CardDescription className="text-slate-400 max-w-sm mt-1">
              This deployment is configured for Hardhat Local Network (Chain ID: 31337). Please switch your wallet network to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <Button
              onClick={switchNetwork}
              className="bg-amber-600 hover:bg-amber-500 text-white gap-2 px-6"
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
