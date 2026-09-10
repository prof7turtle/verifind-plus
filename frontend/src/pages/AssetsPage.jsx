import React, { useEffect, useState } from "react";
import { Layers, PlusCircle, RefreshCw, Trash2, ExternalLink, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useRole } from "@/hooks/useRole";
import { fetchAssets } from "@/utils/api";
import { getAssetContract } from "@/utils/contractConfig";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress, formatDate } from "@/lib/utils";

export function AssetsPage() {
  const { account, signer } = useWallet();
  const { isAdmin, isManager } = useRole();
  const toast = useToast();

  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [includeDecommissioned, setIncludeDecommissioned] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mint Modal State
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [mintFormData, setMintFormData] = useState({
    recipientAddress: "",
    metadataHash: "",
  });
  const [minting, setMinting] = useState(false);

  // Decommission confirmation state
  const [decommissionTokenId, setDecommissionTokenId] = useState(null);
  const [decommissioning, setDecommissioning] = useState(false);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        includeDecommissioned: includeDecommissioned ? "true" : "false",
      };
      if (ownerSearch.trim()) {
        params.owner = ownerSearch.trim().toLowerCase();
      }

      const res = await fetchAssets(params);
      setAssets(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("[Assets] Fetch error:", err);
      setError("Failed to load digital assets from REST API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [page, includeDecommissioned]);

  const handleMintAsset = async (e) => {
    e.preventDefault();
    if (!signer) {
      toast.error("Wallet Required", "Please connect an authorized wallet.");
      return;
    }

    if (!mintFormData.recipientAddress || !mintFormData.metadataHash) {
      toast.error("Validation Error", "Please fill in recipient address and metadata hash.");
      return;
    }

    setMinting(true);
    const toastId = toast.pending("Broadcasting Mint Transaction", "Awaiting approval from your wallet...");

    try {
      const assetContract = getAssetContract(signer);
      const tx = await assetContract.mintAsset(
        mintFormData.recipientAddress.trim(),
        mintFormData.metadataHash.trim()
      );

      toast.dismiss(toastId);
      toast.pending("Confirming Mint On-Chain", `Transaction ${tx.hash.slice(0, 10)}... mining block...`);

      const receipt = await tx.wait();
      toast.dismiss(toastId);
      toast.success(
        "Digital Asset Minted Successfully",
        `Token minted for verified recipient ${truncateAddress(mintFormData.recipientAddress)}`,
        receipt.hash
      );

      setIsMintModalOpen(false);
      setMintFormData({ recipientAddress: "", metadataHash: "" });

      setTimeout(() => {
        loadAssets();
      }, 1200);
    } catch (err) {
      toast.dismiss(toastId);
      // Gracefully surface contract revert reason if recipient has no active identity
      let errorMsg = err.reason || err.data?.message || err.message;
      if (err.message && err.message.includes("Recipient has no active identity")) {
        errorMsg = "Verification Failed: Recipient address has no active identity in IdentityRegistry.sol";
      }
      toast.error("Minting Reverted", errorMsg);
    } finally {
      setMinting(false);
    }
  };

  const handleDecommissionAsset = async (tokenId) => {
    if (!signer) {
      toast.error("Wallet Required", "Please connect an authorized admin wallet.");
      return;
    }

    setDecommissioning(true);
    const toastId = toast.pending("Decommissioning Asset", `Burning token #${tokenId} on-chain...`);

    try {
      const assetContract = getAssetContract(signer);
      const tx = await assetContract.decommissionAsset(tokenId);

      toast.dismiss(toastId);
      toast.pending("Confirming Decommission", `Transaction ${tx.hash.slice(0, 10)}... confirming...`);

      const receipt = await tx.wait();
      toast.dismiss(toastId);
      toast.success(
        "Asset Decommissioned",
        `Token #${tokenId} burned and status permanently recorded.`,
        receipt.hash
      );

      setDecommissionTokenId(null);
      setTimeout(() => {
        loadAssets();
      }, 1200);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Decommission Failed", err.reason || err.message);
    } finally {
      setDecommissioning(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-teal-400" />
            <span>Digital Asset Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tokenized defense assets (ERC-721) with cryptographic provenance and verified identity ownership.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAssets}
            disabled={loading}
            className="gap-1.5 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {(isAdmin || isManager) && (
            <Button
              onClick={() => setIsMintModalOpen(true)}
              size="sm"
              variant="teal"
              className="gap-1.5 text-xs text-white"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Mint Digital Asset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by owner address (0x...)"
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              className="w-64 text-xs h-8 font-mono"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={loadAssets}
              className="text-xs h-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800"
            >
              Filter
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDecommissioned}
              onChange={(e) => {
                setIncludeDecommissioned(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-700 bg-slate-900 text-sky-600 focus:ring-sky-500"
            />
            <span>Include Decommissioned Assets</span>
          </label>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Registered Tokens: <span className="text-white font-semibold">{total}</span>
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Token ID</TableHead>
                <TableHead>Current Owner</TableHead>
                <TableHead>Metadata IPFS / SHA-256 Hash</TableHead>
                <TableHead>Minted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mint Date</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    {isAdmin && <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-500">
                    No digital assets found matching query criteria.
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-xs font-bold text-white">
                      #{item.tokenId}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-teal-400">
                      {item.ownerAddress}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 max-w-xs truncate" title={item.metadataHash}>
                        <FileText className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{item.metadataHash}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {truncateAddress(item.mintedBy)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isDecommissioned ? "destructive" : "active"}>
                        {item.isDecommissioned ? "Decommissioned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {formatDate(item.mintedAt)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {!item.isDecommissioned && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDecommissionTokenId(item.tokenId)}
                            className="h-7 px-2 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Decommission
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mint Asset Dialog */}
      <Dialog open={isMintModalOpen} onOpenChange={setIsMintModalOpen}>
        <form onSubmit={handleMintAsset}>
          <DialogHeader>
            <DialogTitle>Mint Digital Asset (ERC-721)</DialogTitle>
            <DialogDescription>
              Direct contract mint via AssetNFT.sol. Recipient MUST hold a verified active identity in IdentityRegistry.sol.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Recipient Wallet Address *
              </label>
              <Input
                placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                value={mintFormData.recipientAddress}
                onChange={(e) => setMintFormData({ ...mintFormData, recipientAddress: e.target.value })}
                className="font-mono text-xs"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Smart contract will revert if this account is not an active, registered DID.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Artifact Metadata Hash (IPFS CID / SHA-256) *
              </label>
              <Input
                placeholder="QmBELRadarSystemSpec2026 or bafybeicg2..."
                value={mintFormData.metadataHash}
                onChange={(e) => setMintFormData({ ...mintFormData, metadataHash: e.target.value })}
                className="font-mono text-xs"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMintModalOpen(false)}
              disabled={minting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={minting}
              variant="teal"
              className="text-white"
            >
              {minting ? "Authorizing & Minting..." : "Sign & Mint Token"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Decommission Confirmation Dialog */}
      <Dialog open={decommissionTokenId !== null} onOpenChange={() => setDecommissionTokenId(null)}>
        <DialogHeader>
          <DialogTitle>Confirm Permanent Decommissioning</DialogTitle>
          <DialogDescription>
            Are you sure you want to decommission Asset #{decommissionTokenId}?
            This burns the token on-chain via AssetNFT.sol. This action is IRREVERSIBLE and will be recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDecommissionTokenId(null)}
            disabled={decommissioning}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={decommissioning}
            onClick={() => handleDecommissionAsset(decommissionTokenId)}
          >
            {decommissioning ? "Burning Token..." : "Permanently Decommission"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
