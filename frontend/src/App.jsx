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
import { Footer } from "@/components/Footer";
import { SelectRoleModal } from "@/components/SelectRoleModal";

export default function App() {
  return (
    <ToastProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-white text-neutral-950 flex flex-col antialiased selection:bg-neutral-900 selection:text-white">
            <Navbar />
            <SelectRoleModal />
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
            <Footer />
          </div>
        </Router>
      </WalletProvider>
    </ToastProvider>
  );
}
