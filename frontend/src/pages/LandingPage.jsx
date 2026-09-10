import React from "react";
import { Link } from "react-router-dom";
import { Shield, KeyRound, Database, FileCheck, ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { BackgroundMesh } from "@/components/reactbits/BackgroundMesh";
import DecryptedText from "@/components/reactbits/DecryptedText";
import MaskedHeading from "@/components/reactbits/MaskedHeading";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

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
      title: "Digital Asset Tokenization",
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-white text-neutral-950">
      {/* Hero Section with React Bits BackgroundMesh */}
      <BackgroundMesh>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Platform Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs text-neutral-700 font-mono mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>Decentralized Identity & Asset Security Platform</span>
          </div>

          {/* Hero Headline with Slower DecryptedText */}
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight min-h-[120px] sm:min-h-[140px] flex items-center justify-center">
            <DecryptedText
              text="Secure Platform for Identity, Access Control & Asset Management"
              speed={75}
              maxIterations={20}
              animateOn="view"
              revealDirection="center"
              className="text-neutral-950 font-extrabold"
              encryptedClassName="text-neutral-400 font-mono"
            />
          </h1>

          <p className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade decentralized identity registry, fine-grained on-chain RBAC,
            and cryptographic digital asset lifecycle management built for high-assurance operations.
          </p>

          {/* Interactive Cryptographic Signature Hover Element */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-neutral-500">
            <span className="inline-flex items-center gap-1 text-neutral-400">
              <Lock className="h-3 w-3" />
              CRYPTOGRAPHIC PROOF:
            </span>
            <DecryptedText
              text="did:ethr:0x5FbDB2315678afecb367f032d93F642f64180aa3 • VERIFIED"
              speed={60}
              maxIterations={16}
              animateOn="hover"
              className="text-neutral-800 font-semibold cursor-pointer underline-offset-2 hover:underline"
              encryptedClassName="text-neutral-400"
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {account ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2 text-base px-8 h-12 shadow-sm">
                  <span>Enter Security Console</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                onClick={connect}
                disabled={isConnecting}
                className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2 text-base px-8 h-12 shadow-sm"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
              </Button>
            )}
            <Link to="/audit">
              <Button variant="outline" size="lg" className="text-base h-12 px-6 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50">
                View Public Audit Trail
              </Button>
            </Link>
          </div>

          {/* Quick verification checks */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-500 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-800" />
              On-Chain Identity Registry
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-800" />
              OpenZeppelin AccessControl
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-800" />
              Real-time Blockchain Indexer
            </span>
          </div>
        </div>
      </BackgroundMesh>

      {/* MaskedHeading Showcase Section with SpotlightCard & Border Glow */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <SpotlightCard className="p-8 sm:p-12 text-center shadow-sm">
          <span className="inline-block text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-2">
            Cryptographic Provenance
          </span>
          <MaskedHeading
            text="IMMUTABLE LEDGER & PROVENANCE"
            src="/images/crypto_mesh.jpg"
            parallax={20}
            className="text-2xl sm:text-4xl md:text-5xl font-black py-2"
          />
        </SpotlightCard>
      </section>

      {/* Feature Pillar Grid with React Bits SpotlightCard & Border Glow */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">Enterprise Architecture Pillars</h2>
          <p className="mt-2 text-sm text-neutral-500">Engineered to eliminate single points of compromise in critical infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <SpotlightCard
                key={item.title}
                className="p-6 flex flex-col justify-between hover:border-neutral-300 shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-950 mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{item.description}</p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
