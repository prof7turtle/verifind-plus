import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Wallet,
  AlertTriangle,
  Layers,
  Users,
  History,
  Activity,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
  Command,
  Sun,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/utils";

/**
 * Navbar 10 from React Bits Pro specification:
 * Docs header with a version selector, command search, theme toggle, and collapsible mobile nav.
 * Styled with Verifind Plus minimalist enterprise monochrome tokens.
 */
export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, persona, isConnecting, isWrongNetwork, connect, disconnect, switchNetwork } = useWallet();
  const { role } = useRole();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("v1.0.0");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Activity },
    { name: "Identities", path: "/identities", icon: Users },
    { name: "Assets", path: "/assets", icon: Layers },
    { name: "Audit Trail", path: "/audit", icon: History },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/audit?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left Section: Brand & Version Selector */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <Link to="/" className="flex items-center group">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 hover:text-neutral-700 transition-colors">
              Verifind Plus
            </span>
          </Link>

          {/* Version Selector Dropdown */}
          <div className="relative hidden sm:flex items-center">
            <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600 font-mono">
              <span>{selectedVersion}</span>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Select Version"
              >
                <option value="v1.0.0">v1.0.0 (Hardhat Node)</option>
                <option value="v1.1-preview">v1.1-preview</option>
                <option value="v0.9.8-legacy">v0.9.8-legacy</option>
              </select>
              <ChevronDown className="h-3 w-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Center Section: Navigation Links & Command Search */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center max-w-2xl">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Docs Command Search Input */}
          <div className="relative w-56 xl:w-64">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-full items-center justify-between rounded-md border border-neutral-200 bg-neutral-50/80 px-2.5 py-1.5 text-xs text-neutral-400 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-neutral-400" />
                <span className="truncate">Search records...</span>
              </span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right Section: Network, Role, Wallet, Theme & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Indicator (Monochrome) */}
          <div className="hidden xl:flex items-center justify-center h-8 w-8 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600">
            <Sun className="h-4 w-4" />
          </div>

          {/* Network Indicator */}
          {account && (
            <div className="hidden sm:flex items-center gap-1.5">
              {isWrongNetwork ? (
                <button
                  onClick={switchNetwork}
                  className="flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-800 hover:bg-amber-100"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Switch to 31337</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-md bg-neutral-50 border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Hardhat</span>
                </div>
              )}
            </div>
          )}

          {/* User Persona & Role Badge */}
          {account && (
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline text-xs font-semibold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md">
                {persona?.shortName || persona?.name || truncateAddress(account)}
              </span>
              <Badge
                variant={
                  (role || persona?.role) === "ADMIN"
                    ? "admin"
                    : (role || persona?.role) === "MANAGER"
                    ? "manager"
                    : (role || persona?.role) === "AUDITOR"
                    ? "auditor"
                    : "user"
                }
              >
                {role || persona?.role || "USER"}
              </Badge>
            </div>
          )}

          {/* Connect / Disconnect / Switch Role */}
          {account ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={connect}
                className="gap-1 text-xs text-neutral-700 hover:text-neutral-950 border-neutral-200 bg-white hover:bg-neutral-50 h-8 px-2 sm:px-2.5"
                title="Switch Role or Account"
              >
                <Users className="h-3.5 w-3.5 text-neutral-600" />
                <span className="hidden sm:inline">Switch Role</span>
              </Button>

              <span className="hidden xl:inline text-xs font-mono text-neutral-500">
                {truncateAddress(account)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="gap-1 text-xs text-neutral-600 hover:text-neutral-900 border-neutral-200 h-8 px-2 sm:px-2.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              size="sm"
              className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white h-8 text-xs shadow-sm px-3"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </Button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center p-1.5 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in fade-in-0 slide-in-from-top-2">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search audit trail, identities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-300 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <Button type="submit" size="sm" className="h-8 text-xs bg-neutral-900 text-white">
              Search
            </Button>
          </form>

          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-1 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Footer Status */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>Version: {selectedVersion}</span>
            {account && <span>{truncateAddress(account)}</span>}
          </div>
        </div>
      )}

      {/* Command Search Modal (Triggered by ⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-neutral-950/40 transition-opacity"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border-b border-neutral-200 pb-3">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search addresses, tokens, audit logs (press Enter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
                ESC
              </kbd>
            </form>

            {/* Quick Navigation suggestions */}
            <div className="py-2 text-xs">
              <p className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Quick Navigation
              </p>
              <div className="space-y-0.5 mt-1">
                {navLinks.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-left transition-colors"
                  >
                    <item.icon className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Go to {item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
