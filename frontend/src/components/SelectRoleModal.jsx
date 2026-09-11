import React from "react";
import { Shield, ShieldAlert, KeyRound, UserCheck, Users, ExternalLink, ArrowRight, CheckCircle2, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { SEEDED_PERSONAS_LIST } from "@/utils/personas";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";

export function SelectRoleModal() {
  const {
    account,
    isConnectModalOpen,
    setIsConnectModalOpen,
    connectPersona,
    connectMetaMask,
    isConnecting,
  } = useWallet();

  return (
    <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
      <div className="space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <Users className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-950">
              Connect Wallet & Select Role
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500">
            Select an authorized role persona below or connect any account from your MetaMask wallet.
          </DialogDescription>
        </DialogHeader>

        {/* MetaMask Direct Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => connectMetaMask(false)}
            disabled={isConnecting}
            className="w-full justify-start gap-2 h-10 text-xs border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900"
          >
            <Wallet className="h-4 w-4 text-neutral-700 shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">Active MetaMask Account</div>
              <div className="text-[10px] text-neutral-500">Connect currently selected</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => connectMetaMask(true)}
            disabled={isConnecting}
            className="w-full justify-start gap-2 h-10 text-xs border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900"
          >
            <ExternalLink className="h-4 w-4 text-neutral-700 shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">Choose in MetaMask</div>
              <div className="text-[10px] text-neutral-500">Trigger account selection popup</div>
            </div>
          </Button>
        </div>

        {/* Seeded Role Personas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Authorized Role Personas (Instant 1-Click Connect)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">Hardhat 31337</span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {SEEDED_PERSONAS_LIST.map((item) => {
              const isSelected = account && account.toLowerCase() === item.address.toLowerCase();

              return (
                <button
                  key={item.address}
                  type="button"
                  onClick={() => connectPersona(item.address)}
                  disabled={isConnecting}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-neutral-950 bg-neutral-50 shadow-sm"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/70"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {item.role === "ADMIN" ? (
                        <Shield className="h-4 w-4 text-neutral-950" />
                      ) : item.role === "MANAGER" ? (
                        <KeyRound className="h-4 w-4 text-neutral-800" />
                      ) : item.role === "AUDITOR" ? (
                        <UserCheck className="h-4 w-4 text-neutral-700" />
                      ) : item.deactivated ? (
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                      ) : (
                        <Users className="h-4 w-4 text-neutral-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{item.name}</span>
                        <Badge variant={item.badgeVariant}>{item.role}</Badge>
                        {item.deactivated && (
                          <span className="text-[10px] text-red-600 font-mono bg-red-50 border border-red-200 px-1 rounded">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{item.title}</div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-1">
                        {truncateAddress(item.address)}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 font-medium">
                        Connect <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default SelectRoleModal;
