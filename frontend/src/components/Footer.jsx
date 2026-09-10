import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Activity, ArrowUpRight, Github, Lock, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-900 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-neutral-100">
          {/* Brand & Mission Column */}
          <div className="md:col-span-1 space-y-4">
            <span className="text-xl font-black tracking-tight text-neutral-950">
              Verifind Plus
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
              Decentralized cryptographic platform for on-chain identity verification, fine-grained access control, and tamper-proof digital asset provenance.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Hardhat 31337 Online</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950 font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>
                <Link to="/dashboard" className="hover:text-neutral-950 transition-colors">
                  Security Operations Dashboard
                </Link>
              </li>
              <li>
                <Link to="/identities" className="hover:text-neutral-950 transition-colors">
                  Decentralized Identity Registry
                </Link>
              </li>
              <li>
                <Link to="/assets" className="hover:text-neutral-950 transition-colors">
                  Digital Asset Management
                </Link>
              </li>
              <li>
                <Link to="/audit" className="hover:text-neutral-950 transition-colors">
                  Forensic Audit Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950 font-mono">
              Standards
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neutral-700" />
                <span>W3C Decentralized Identifiers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neutral-700" />
                <span>OpenZeppelin AccessControl</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neutral-700" />
                <span>ERC-721 Digital Ownership</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neutral-700" />
                <span>Append-Only Indexed Telemetry</span>
              </li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-950 font-mono">
              Infrastructure
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 font-mono">
              <li>Chain ID: 31337 (Local EVM)</li>
              <li>RPC: 127.0.0.1:8545</li>
              <li>Storage: MongoDB Replica Index</li>
              <li>Client: Ethers.js v6 Browser Provider</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <p>© 2026 Verifind Plus. High-assurance cryptographic security platform.</p>
          <div className="flex items-center gap-6">
            <Link to="/audit" className="hover:text-neutral-900 transition-colors">
              Public Ledger
            </Link>
            <Link to="/dashboard" className="hover:text-neutral-900 transition-colors">
              Console
            </Link>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-400">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
