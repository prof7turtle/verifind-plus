import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Wallet, AlertTriangle, Layers, Users, History, Activity, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();
  const { account, isConnecting, isWrongNetwork, connect, disconnect, switchNetwork } = useWallet();
  const { role, isAdmin } = useRole();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Activity },
    { name: "Identities", path: "/identities", icon: Users },
    { name: "Assets", path: "/assets", icon: Layers },
    { name: "Audit Trail", path: "/audit", icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & PSU Tag */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 transition-colors group-hover:border-sky-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">VeriFind Plus</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">BEL</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">SIH 26125 SECURE PLATFORM</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-slate-800 text-sky-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          {account && (
            <div className="hidden sm:flex items-center gap-1.5">
              {isWrongNetwork ? (
                <button
                  onClick={switchNetwork}
                  className="flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs text-amber-400 hover:bg-amber-500/20"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Switch to Local 31337</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Hardhat Node</span>
                </div>
              )}
            </div>
          )}

          {/* Role Badge */}
          {account && role && (
            <Badge
              variant={
                role === "ADMIN"
                  ? "admin"
                  : role === "MANAGER"
                  ? "manager"
                  : role === "AUDITOR"
                  ? "auditor"
                  : "user"
              }
            >
              {role}
            </Badge>
          )}

          {/* Connect / User Info Button */}
          {account ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-mono text-slate-300 font-semibold">{truncateAddress(account)}</span>
                <span className="text-[10px] text-slate-500 font-mono">Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="gap-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/40"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              size="sm"
              className="gap-2 bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
