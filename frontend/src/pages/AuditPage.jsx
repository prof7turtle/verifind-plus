import React, { useEffect, useState } from "react";
import { History, Search, RefreshCw, Filter, FileCode2, ExternalLink, ShieldAlert, Check } from "lucide-react";
import { fetchAuditLogs, fetchAuditByAddress } from "@/utils/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { truncateAddress, formatDate } from "@/lib/utils";

export function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inspector Dialog State for Viewing Full Decoded Payload
  const [inspectLog, setInspectLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      if (addressSearch.trim()) {
        const res = await fetchAuditByAddress(addressSearch.trim().toLowerCase());
        setLogs(res.data.data || []);
        setTotal(res.data.count || 0);
      } else {
        const params = { page, limit: 15 };
        if (eventTypeFilter) params.eventType = eventTypeFilter;
        if (contractFilter) params.contractName = contractFilter;

        const res = await fetchAuditLogs(params);
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("[Audit] Fetch error:", err);
      setError("Failed to query audit logs from indexing service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, eventTypeFilter, contractFilter]);

  const handleAddressSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const clearAddressSearch = () => {
    setAddressSearch("");
    setPage(1);
    setTimeout(() => {
      loadLogs();
    }, 50);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Forensic Blockchain Audit Trail</h1>
          </div>
          <p className="text-sm text-slate-400">
            Immutable on-chain event ledger indexed directly from smart contracts. Strictly append-only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            className="gap-1.5 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </Button>
        </div>
      </div>

      {/* Query & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-lg border border-slate-800">
        <form onSubmit={handleAddressSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search forensic trail by address (0x...)"
            value={addressSearch}
            onChange={(e) => setAddressSearch(e.target.value)}
            className="font-mono text-xs h-9 bg-slate-950/80"
          />
          <Button type="submit" size="sm" className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 px-4">
            <Search className="h-3.5 w-3.5 mr-1" />
            Search
          </Button>
          {addressSearch && (
            <Button type="button" variant="outline" size="sm" onClick={clearAddressSearch} className="text-xs h-9">
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Contract:</span>
            <Select
              value={contractFilter}
              onChange={(e) => {
                setContractFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 w-36 bg-slate-950/80"
            >
              <option value="">All Contracts</option>
              <option value="IdentityRegistry">IdentityRegistry</option>
              <option value="AssetNFT">AssetNFT</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Event:</span>
            <Select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 w-44 bg-slate-950/80"
            >
              <option value="">All Event Types</option>
              <option value="IdentityRegistered">IdentityRegistered</option>
              <option value="IdentityDeactivated">IdentityDeactivated</option>
              <option value="RoleGrantedAudit">RoleGrantedAudit</option>
              <option value="AssetMinted">AssetMinted</option>
              <option value="AssetTransferredWithAudit">AssetTransferredWithAudit</option>
              <option value="AssetDecommissioned">AssetDecommissioned</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Event Type</TableHead>
                <TableHead className="w-32">Contract</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead className="w-24">Block #</TableHead>
                <TableHead>Decoded Arguments</TableHead>
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead className="w-20 text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No indexed audit logs found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Badge
                        variant={
                          item.eventType === "IdentityRegistered"
                            ? "user"
                            : item.eventType === "RoleGrantedAudit"
                            ? "admin"
                            : item.eventType === "AssetMinted"
                            ? "default"
                            : item.eventType === "AssetTransferredWithAudit"
                            ? "manager"
                            : item.eventType === "AssetDecommissioned"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.eventType}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-300">
                      {item.contractName}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-sky-400" title={item.transactionHash}>
                      {truncateAddress(item.transactionHash)}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-400">
                      <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                        #{item.blockNumber}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-300 max-w-xs truncate" title={JSON.stringify(item.args)}>
                      {Object.entries(item.args || {})
                        .filter(([k]) => !k.startsWith("_") && k !== "timestamp")
                        .map(([k, v]) => `${k}=${typeof v === "string" && v.startsWith("0x") ? truncateAddress(v) : v}`)
                        .join(" • ")}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-400">
                      {formatDate(item.timestamp)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectLog(item)}
                        className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                      >
                        <FileCode2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Raw Payload Inspector Modal */}
      <Dialog open={inspectLog !== null} onOpenChange={() => setInspectLog(null)}>
        {inspectLog && (
          <div>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Cryptographic Event Payload</span>
                <Badge variant="outline">{inspectLog.eventType}</Badge>
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                Tx: {inspectLog.transactionHash}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200 overflow-auto max-h-72">
                <pre>{JSON.stringify(inspectLog, null, 2)}</pre>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInspectLog(null)}>
                Close Inspector
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}
