import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import { WalletProvider } from "@/hooks/useWallet";
import { Navbar } from "@/components/Navbar";
import { WalletGuard } from "@/components/WalletGuard";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { IdentitiesPage } from "@/pages/IdentitiesPage";
import { AssetsPage } from "@/pages/AssetsPage";
import { AuditPage } from "@/pages/AuditPage";

export default function App() {
  return (
    <ToastProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500/30 selection:text-sky-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <WalletGuard>
                      <DashboardPage />
                    </WalletGuard>
                  }
                />
                <Route
                  path="/identities"
                  element={
                    <WalletGuard>
                      <IdentitiesPage />
                    </WalletGuard>
                  }
                />
                <Route
                  path="/assets"
                  element={
                    <WalletGuard>
                      <AssetsPage />
                    </WalletGuard>
                  }
                />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </WalletProvider>
    </ToastProvider>
  );
}
