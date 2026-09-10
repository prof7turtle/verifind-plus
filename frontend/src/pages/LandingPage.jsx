import React from "react";
import { Link } from "react-router-dom";
import { Shield, KeyRound, Database, FileCheck, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { BackgroundMesh } from "@/components/reactbits/BackgroundMesh";

export function LandingPage() {
  const { account, connect, isConnecting } = useWallet();

  const features = [
    {
      title: "Decentralized Identifiers (DIDs)",
      description: "Cryptographic, self-sovereign identities tied to Ethereum addresses without central failure points.",
      icon: KeyRound,
      badge: "W3C DID Standard",
    },
    {
      title: "Role-Based Access Control",
      description: "On-chain RBAC enforced via OpenZeppelin AccessControl across Admin, Manager, Auditor, and User tiers.",
      icon: Shield,
      badge: "Smart Contracts",
    },
    {
      title: "Defense Asset Tokenization",
      description: "ERC-721 digital asset ownership with strict identity verification preventing unauthorized transfers.",
      icon: Database,
      badge: "ERC-721 / IPFS",
    },
    {
      title: "Tamper-Proof Audit Trail",
      description: "Append-only, verifiable event ledger indexed into a high-performance forensic querying layer.",
      icon: FileCheck,
      badge: "Zero-Tamper Logs",
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section with React Bits BackgroundMesh */}
      <BackgroundMesh>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Government / PSU Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3.5 py-1 text-xs text-sky-300 font-mono mb-6 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Smart India Hackathon 2024 • SIH 26125 • Bharat Electronics Limited</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
            Secure Platform for Identity, Access Control & Asset Management
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade decentralized identity registry, fine-grained on-chain RBAC,
            and cryptographic digital asset lifecycle management built for defense and high-assurance operations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {account ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-base px-8 h-12 shadow-lg shadow-sky-600/20">
                  <span>Enter Security Console</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                onClick={connect}
                disabled={isConnecting}
                className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-base px-8 h-12 shadow-lg shadow-sky-600/20"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
              </Button>
            )}
            <Link to="/audit">
              <Button variant="outline" size="lg" className="text-base h-12 px-6 border-slate-700 bg-slate-900/60 hover:bg-slate-800">
                View Public Audit Trail
              </Button>
            </Link>
          </div>

          {/* Quick verification checks */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              On-Chain Identity Registry
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              OpenZeppelin AccessControl
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Real-time Blockchain Indexer
            </span>
          </div>
        </div>
      </BackgroundMesh>

      {/* Feature Pillar Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Architecture Pillars</h2>
          <p className="mt-2 text-sm text-slate-400">Engineered to eliminate single points of compromise in defense supply chains and critical infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
        VeriFind Plus • SIH 26125 • Developed for Bharat Electronics Limited • Hardhat & MongoDB Architecture
      </footer>
    </div>
  );
}
