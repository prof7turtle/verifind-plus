import React, { useEffect, useState } from "react";
import { Users, PlusCircle, RefreshCw, Filter, ExternalLink, Shield, CheckCircle, XCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useRole } from "@/hooks/useRole";
import { fetchIdentities } from "@/utils/api";
import { getIdentityContract, ROLE_HASHES } from "@/utils/contractConfig";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress, formatDate } from "@/lib/utils";

export function IdentitiesPage() {
  const { account, signer, connectPersona } = useWallet();
  const { role, isAdmin } = useRole();
  const toast = useToast();

  const [identities, setIdentities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleHelpModalOpen, setIsRoleHelpModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userAddress: "",
    did: "",
    roleKey: "USER_ROLE",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadIdentities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;

      const res = await fetchIdentities(params);
      setIdentities(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("[Identities] Fetch error:", err);
      setError("Failed to load identities from REST API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdentities();
  }, [page, roleFilter]);

  const handleRegisterIdentity = async (e) => {
    e.preventDefault();
    if (!signer) {
      toast.error("Wallet Required", "Please connect an authorized wallet.");
      return;
    }

    if (!formData.userAddress || !formData.did) {
      toast.error("Validation Error", "Please fill in all required fields.");
      return;
    }

    const roleHash = ROLE_HASHES[formData.roleKey];
    setSubmitting(true);
    const toastId = toast.pending("Submitting Transaction", "Awaiting confirmation from your wallet...");

    try {
      const identityContract = getIdentityContract(signer);
      const tx = await identityContract.registerIdentity(
        formData.userAddress.trim(),
        formData.did.trim(),
        roleHash
      );

      toast.dismiss(toastId);
      toast.pending("Confirming On-Chain", `Transaction ${tx.hash.slice(0, 10)}... pending confirmation...`);

      const receipt = await tx.wait();
      toast.dismiss(toastId);
      toast.success(
        "Identity Registered Successfully",
        `New DID registered on-chain for ${truncateAddress(formData.userAddress)}`,
        receipt.hash
      );

      setIsModalOpen(false);
      setFormData({ userAddress: "", did: "", roleKey: "USER_ROLE" });

      // Refresh list after brief delay to allow indexer to ingest event
      setTimeout(() => {
        loadIdentities();
      }, 1200);
    } catch (err) {
      toast.dismiss(toastId);
      const reason = err.reason || err.data?.message || err.message;
      toast.error("Registration Failed", reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-neutral-900" />
            <span>Decentralized Identity Registry</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            W3C DID documents and Role-Based Access Control managed directly on-chain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadIdentities}
            disabled={loading}
            className="gap-1.5 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => {
              if (isAdmin) {
                setIsModalOpen(true);
              } else {
                setIsRoleHelpModalOpen(true);
              }
            }}
            size="sm"
            className="bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 text-xs shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Register New Identity</span>
            {!isAdmin && (
              <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-1.5 py-0.5 rounded ml-1">
                Admin
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span className="text-xs text-neutral-500 font-medium">Filter by Role:</span>
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-40 text-xs h-8"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="AUDITOR">Auditor</option>
            <option value="USER">User</option>
          </Select>
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Total Records: <span className="text-neutral-950 font-semibold">{total}</span>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-neutral-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ethereum Address</TableHead>
                <TableHead>Decentralized Identifier (DID)</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : identities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-neutral-400">
                    No registered identities found.
                  </TableCell>
                </TableRow>
              ) : (
                identities.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-xs text-neutral-900 font-medium">
                      {item.address}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-600">
                      {item.did}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.role === "ADMIN"
                            ? "admin"
                            : item.role === "MANAGER"
                            ? "manager"
                            : item.role === "AUDITOR"
                            ? "auditor"
                            : "user"
                        }
                      >
                        {item.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "active" : "inactive"}>
                        {item.isActive ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">
                      {formatDate(item.registeredAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Registration Dialog (Direct Smart Contract Call) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <form onSubmit={handleRegisterIdentity}>
          <DialogHeader>
            <DialogTitle>Register Cryptographic Identity</DialogTitle>
            <DialogDescription>
              Execute on-chain transaction directly to IdentityRegistry.sol via your connected admin wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Ethereum Wallet Address *
              </label>
              <Input
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                value={formData.userAddress}
                onChange={(e) => setFormData({ ...formData, userAddress: e.target.value })}
                className="font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                DID Identifier String *
              </label>
              <Input
                placeholder="did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                value={formData.did}
                onChange={(e) => setFormData({ ...formData, did: e.target.value })}
                className="font-mono text-xs"
                required
              />
              <p className="text-[10px] text-neutral-400 mt-1">Must conform to W3C Decentralized Identifier scheme.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Initial RBAC Role Assignment *
              </label>
              <Select
                value={formData.roleKey}
                onChange={(e) => setFormData({ ...formData, roleKey: e.target.value })}
              >
                <option value="USER_ROLE">USER — Standard Participant</option>
                <option value="MANAGER_ROLE">MANAGER — Asset Mint & Team Lead</option>
                <option value="AUDITOR_ROLE">AUDITOR — Security Compliance Read-Only</option>
                <option value="ADMIN_ROLE">ADMIN — Full Platform Governance</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {submitting ? "Signing & Broadcasting..." : "Sign & Register on Chain"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Admin Role Guidance Dialog */}
      <Dialog open={isRoleHelpModalOpen} onOpenChange={setIsRoleHelpModalOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
                <Shield className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-neutral-950">
                ADMIN_ROLE Required
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-500 leading-relaxed">
              Registering new Decentralized Identifiers (DIDs) on the Ethereum blockchain is restricted
              at the smart contract level to accounts with <span className="font-mono font-semibold text-neutral-900">ADMIN_ROLE</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Your Current Connected Role:</span>
              <Badge variant={role === "MANAGER" ? "manager" : role === "AUDITOR" ? "auditor" : "user"}>
                {role || "NOT CONNECTED"}
              </Badge>
            </div>
            <p className="text-[11px] text-neutral-600">
              To test or register new defense personnel identities, switch to an authorized Admin account below:
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              onClick={() => {
                connectPersona("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
                setIsRoleHelpModalOpen(false);
                setTimeout(() => setIsModalOpen(true), 300);
              }}
              className="w-full justify-between bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-10"
            >
              <span>Switch to Commander A. Sharma (SecOps Admin)</span>
              <span className="font-mono text-[10px] text-neutral-400">0x7099...79C8</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                connectPersona("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                setIsRoleHelpModalOpen(false);
                setTimeout(() => setIsModalOpen(true), 300);
              }}
              className="w-full justify-between border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-xs h-10"
            >
              <span>Switch to Primary Deployer / Architect</span>
              <span className="font-mono text-[10px] text-neutral-500">0xf39F...2266</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
