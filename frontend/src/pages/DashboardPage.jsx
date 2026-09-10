import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Layers, History, Shield, ArrowUpRight, Activity, PlusCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useRole } from "@/hooks/useRole";
import { fetchIdentities, fetchAssets, fetchAuditLogs, fetchSystemHealth } from "@/utils/api";
import { AnimatedCounter } from "@/components/reactbits/AnimatedCounter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress, formatDate } from "@/lib/utils";

export function DashboardPage() {
  const { account } = useWallet();
  const { role, did, isAdmin, isManager } = useRole();

  const [stats, setStats] = useState({
    identitiesCount: 0,
    assetsCount: 0,
    auditCount: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [identitiesRes, assetsRes, auditRes, healthRes] = await Promise.all([
        fetchIdentities({ limit: 1 }),
        fetchAssets({ limit: 1 }),
        fetchAuditLogs({ limit: 6 }),
        fetchSystemHealth().catch(() => null),
      ]);

      setStats({
        identitiesCount: identitiesRes.data.total || 0,
        assetsCount: assetsRes.data.total || 0,
        auditCount: auditRes.data.total || 0,
      });

      setRecentLogs(auditRes.data.data || []);
      if (healthRes && healthRes.data) {
        setSystemStatus(healthRes.data);
      }
    } catch (err) {
      console.error("[Dashboard] Fetch error:", err);
      setError("Failed to load dashboard metrics from backend. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">Security Operations Dashboard</h1>
            {role && (
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
                {role} ACCESS
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500 font-mono">
            Identity: {account ? truncateAddress(account) : "—"} {did ? `• ${did}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
            className="gap-1.5 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {isAdmin && (
            <Link to="/identities">
              <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Register Identity</span>
              </Button>
            </Link>
          )}

          {(isAdmin || isManager) && (
            <Link to="/assets">
              <Button size="sm" variant="outline" className="gap-1.5 border-neutral-300 text-neutral-900 hover:bg-neutral-50">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Mint Asset</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Metrics Cards with React Bits AnimatedCounter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Identities */}
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Registered Identities
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-neutral-950 font-mono">
                <AnimatedCounter value={stats.identitiesCount} />
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">DIDs bound to addresses</p>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Active Digital Assets
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-neutral-950 font-mono">
                <AnimatedCounter value={stats.assetsCount} />
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">ERC-721 tokenized artifacts</p>
          </CardContent>
        </Card>

        {/* Audit Events */}
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Audit Log Records
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <History className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-neutral-950 font-mono">
                <AnimatedCounter value={stats.auditCount} />
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">Tamper-proof on-chain logs</p>
          </CardContent>
        </Card>

        {/* Node & Indexer Status */}
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Indexer Telemetry
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-lg font-semibold text-neutral-900">Synchronized</span>
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              Block #{systemStatus?.blockchainListener?.lastIndexedBlock ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="border-neutral-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-950">Recent Immutable Audit Stream</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5 font-mono">Real-time indexed on-chain state changes</p>
          </div>
          <Link to="/audit" className="text-xs text-neutral-900 hover:text-neutral-600 flex items-center gap-1 font-mono font-medium underline-offset-4 hover:underline">
            <span>View Full Trail</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-sm">
              No audit events found. Actions performed on smart contracts will appear here automatically.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentLogs.map((log) => (
                <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        log.eventType === "IdentityRegistered"
                          ? "user"
                          : log.eventType === "AssetMinted"
                          ? "default"
                          : log.eventType === "AssetTransferredWithAudit"
                          ? "manager"
                          : log.eventType === "AssetDecommissioned"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {log.eventType}
                    </Badge>
                    <span className="text-xs font-mono text-neutral-700">
                      {log.contractName} • Tx: {truncateAddress(log.transactionHash)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                    <span>Block #{log.blockNumber}</span>
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
