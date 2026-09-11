import React, { useEffect, useState } from "react";
import {
  Layers,
  PlusCircle,
  RefreshCw,
  Trash2,
  Send,
  ExternalLink,
  Shield,
  ShieldCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  Users,
} from "lucide-react";
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
import { truncateAddress, formatDate, waitForTxReceipt } from "@/lib/utils";

export function AssetsPage() {
  const { account, signer, provider, connectPersona } = useWallet();
  const { role, isAdmin, isManager } = useRole();
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
  const [isMintRoleHelpOpen, setIsMintRoleHelpOpen] = useState(false);
  const [mintFormData, setMintFormData] = useState({
    recipientAddress: "",
    metadataHash: "",
  });
  const [minting, setMinting] = useState(false);

  // Transfer / Give Access Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    tokenId: "",
    toAddress: "",
  });
  const [transferring, setTransferring] = useState(false);

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
    let activeToastId = toast.pending("Broadcasting Mint Transaction", "Awaiting approval from your wallet...");

    try {
      const assetContract = getAssetContract(signer);
      const tx = await assetContract.mintAsset(
        mintFormData.recipientAddress.trim(),
        mintFormData.metadataHash.trim()
      );

      toast.dismiss(activeToastId);
      activeToastId = toast.pending("Confirming Mint On-Chain", `Transaction ${tx.hash.slice(0, 10)}... mining block...`);

      const receipt = await waitForTxReceipt(tx, provider);
      toast.dismiss(activeToastId);
      toast.success(
        "Digital Asset Minted Successfully",
        `Token minted for verified recipient ${truncateAddress(mintFormData.recipientAddress)}`,
        receipt?.hash || tx.hash
      );

      setIsMintModalOpen(false);
      setMintFormData({ recipientAddress: "", metadataHash: "" });

      setTimeout(() => {
        loadAssets();
      }, 1000);
    } catch (err) {
      toast.dismiss(activeToastId);
      let errorMsg = err.reason || err.data?.message || err.message;
      if (err.message && err.message.includes("Recipient has no active identity")) {
        errorMsg = "Verification Failed: Recipient address has no active identity in IdentityRegistry.sol";
      }
      toast.error("Minting Reverted", errorMsg);
    } finally {
      setMinting(false);
    }
  };

  const handleTransferAsset = async (e) => {
    e.preventDefault();
    if (!signer) {
      toast.error("Wallet Required", "Please connect an authorized wallet.");
      return;
    }

    if (!transferFormData.tokenId || !transferFormData.toAddress) {
      toast.error("Validation Error", "Please provide token ID and recipient address.");
      return;
    }

    setTransferring(true);
    let activeToastId = toast.pending("Transferring Asset", "Awaiting approval from your wallet...");

    try {
      const assetContract = getAssetContract(signer);
      const currentTokenId = Number(transferFormData.tokenId);
      const targetRecipient = transferFormData.toAddress.trim();

      // Find current owner
      let currentTokenOwner = account;
      try {
        currentTokenOwner = await assetContract.ownerOf(currentTokenId);
      } catch {
        // Fallback
      }

      const tx = await assetContract.transferFrom(currentTokenOwner, targetRecipient, currentTokenId);

      toast.dismiss(activeToastId);
      activeToastId = toast.pending("Confirming Handover On-Chain", `Transaction ${tx.hash.slice(0, 10)}... confirming...`);

      const receipt = await waitForTxReceipt(tx, provider);
      toast.dismiss(activeToastId);
      toast.success(
        "Asset Access Granted (Transferred)",
        `Token #${currentTokenId} transferred to ${truncateAddress(targetRecipient)}`,
        receipt?.hash || tx.hash
      );

      setIsTransferModalOpen(false);
      setTransferFormData({ tokenId: "", toAddress: "" });

      setTimeout(() => {
        loadAssets();
      }, 1000);
    } catch (err) {
      toast.dismiss(activeToastId);
      toast.error("Transfer Failed", err.reason || err.data?.message || err.message);
    } finally {
      setTransferring(false);
    }
  };

  const handleDecommissionAsset = async (tokenId) => {
    if (!signer) {
      toast.error("Wallet Required", "Please connect an authorized admin wallet.");
      return;
    }

    setDecommissioning(true);
    let activeToastId = toast.pending("Decommissioning Asset", `Burning token #${tokenId} on-chain...`);

    try {
      const assetContract = getAssetContract(signer);
      const tx = await assetContract.decommissionAsset(tokenId);

      toast.dismiss(activeToastId);
      activeToastId = toast.pending("Confirming Decommission", `Transaction ${tx.hash.slice(0, 10)}... confirming...`);

      const receipt = await waitForTxReceipt(tx, provider);
      toast.dismiss(activeToastId);
      toast.success(
        "Asset Decommissioned",
        `Token #${tokenId} burned and status permanently recorded.`,
        receipt?.hash || tx.hash
      );

      setDecommissionTokenId(null);
      setTimeout(() => {
        loadAssets();
      }, 1000);
    } catch (err) {
      toast.dismiss(activeToastId);
      toast.error("Decommission Failed", err.reason || err.message);
    } finally {
      setDecommissioning(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-neutral-900" />
            <span>Digital Asset Registry</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Tokenized defense assets (ERC-721) with cryptographic provenance and verified identity ownership.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAssets}
            disabled={loading}
            className="gap-1.5 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {/* Give Access / Transfer Button - Always Visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTransferFormData({ tokenId: "", toAddress: "" });
              setIsTransferModalOpen(true);
            }}
            className="border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 gap-1.5 text-xs h-8"
          >
            <Send className="h-3.5 w-3.5 text-neutral-700" />
            <span>Give Access / Transfer</span>
          </Button>

          {/* Mint Asset Button - Always Visible */}
          <Button
            onClick={() => {
              if (isAdmin || isManager) {
                setIsMintModalOpen(true);
              } else {
                setIsMintRoleHelpOpen(true);
              }
            }}
            size="sm"
            className="bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 text-xs h-8 shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Mint Digital Asset</span>
            {!(isAdmin || isManager) && (
              <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-1.5 py-0.5 rounded ml-1">
                Admin/Mgr
              </span>
            )}
          </Button>
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
              className="h-8 text-xs border-neutral-200"
            >
              Search
            </Button>
            {ownerSearch && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setOwnerSearch("");
                  setTimeout(loadAssets, 50);
                }}
                className="h-8 text-xs text-neutral-500"
              >
                Clear
              </Button>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDecommissioned}
              onChange={(e) => {
                setIncludeDecommissioned(e.target.checked);
                setPage(1);
              }}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4"
            />
            <span>Show Decommissioned Assets</span>
          </label>
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Total Assets: <span className="font-semibold text-neutral-900">{total}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Assets Table */}
      <Card>
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
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-neutral-400">
                    No digital assets found matching query criteria.
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-xs font-bold text-neutral-950">
                      #{item.tokenId}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-900">
                      {item.ownerAddress}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-600">
                      <div className="flex items-center gap-1.5 max-w-xs truncate" title={item.metadataHash}>
                        <FileText className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{item.metadataHash}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">
                      {truncateAddress(item.mintedBy)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isDecommissioned ? "destructive" : "active"}>
                        {item.isDecommissioned ? "Decommissioned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">
                      {formatDate(item.mintedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!item.isDecommissioned && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTransferFormData({ tokenId: String(item.tokenId), toAddress: "" });
                              setIsTransferModalOpen(true);
                            }}
                            className="h-7 px-2 text-xs border-neutral-200 hover:border-neutral-300 text-neutral-800"
                            title="Give Access / Transfer Token"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Give Access
                          </Button>
                        )}

                        {isAdmin && !item.isDecommissioned && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDecommissionTokenId(item.tokenId)}
                            className="h-7 px-2 text-xs"
                            title="Burn / Decommission Token"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Decommission
                          </Button>
                        )}
                      </div>
                    </TableCell>
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
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Recipient Wallet Address *
              </label>
              <Input
                placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                value={mintFormData.recipientAddress}
                onChange={(e) => setMintFormData({ ...mintFormData, recipientAddress: e.target.value })}
                className="font-mono text-xs"
                required
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-400">Quick Recipient:</span>
                <button
                  type="button"
                  onClick={() => setMintFormData({ ...mintFormData, recipientAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" })}
                  className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200"
                >
                  Dr. Nair (Manager)
                </button>
                <button
                  type="button"
                  onClick={() => setMintFormData({ ...mintFormData, recipientAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" })}
                  className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200"
                >
                  R. Kulkarni (Operator)
                </button>
                <button
                  type="button"
                  onClick={() => setMintFormData({ ...mintFormData, recipientAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" })}
                  className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200"
                >
                  Cmdr. Sharma (Admin)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Artifact Metadata Hash (IPFS CID / SHA-256) *
              </label>
              <Input
                placeholder="ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
                value={mintFormData.metadataHash}
                onChange={(e) => setMintFormData({ ...mintFormData, metadataHash: e.target.value })}
                className="font-mono text-xs"
                required
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Cryptographic digest referencing technical specifications, schematics, or firmware builds.
              </p>
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
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {minting ? "Signing & Minting..." : "Mint Digital Asset"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Give Access / Transfer Asset Dialog */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <form onSubmit={handleTransferAsset}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
                <Send className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-neutral-950">
                Give Access / Transfer Digital Asset
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-500">
              Grant asset access and transfer ownership to another registered personnel on-chain via ERC-721.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Select Token ID to Transfer *
              </label>
              <Input
                type="number"
                placeholder="e.g. 1, 2, 3"
                value={transferFormData.tokenId}
                onChange={(e) => setTransferFormData({ ...transferFormData, tokenId: e.target.value })}
                className="font-mono text-xs"
                required
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Enter the numeric Token ID of the asset being handed over.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                New Recipient / Personnel Address *
              </label>
              <Input
                placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                value={transferFormData.toAddress}
                onChange={(e) => setTransferFormData({ ...transferFormData, toAddress: e.target.value })}
                className="font-mono text-xs"
                required
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-neutral-400">Quick Recipient:</span>
                <button
                  type="button"
                  onClick={() => setTransferFormData({ ...transferFormData, toAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" })}
                  className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200"
                >
                  Dr. Nair (Manager)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferFormData({ ...transferFormData, toAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" })}
                  className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200"
                >
                  R. Kulkarni (Operator)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferFormData({ ...transferFormData, toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" })}
                  className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200"
                >
                  Cmdr. Sharma (Admin)
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTransferModalOpen(false)}
              disabled={transferring}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={transferring}
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {transferring ? "Transferring on Chain..." : "Sign & Transfer Access"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Mint Role Guidance Dialog */}
      <Dialog open={isMintRoleHelpOpen} onOpenChange={setIsMintRoleHelpOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
                <Shield className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-neutral-950">
                MINTER_ROLE Required
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-500 leading-relaxed">
              Minting new digital asset tokens on the blockchain requires <span className="font-mono font-semibold text-neutral-900">MINTER_ROLE</span> or an authorized Manager/Admin tier.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Your Current Connected Role:</span>
              <Badge variant={role === "AUDITOR" ? "auditor" : "user"}>
                {role || "NOT CONNECTED"}
              </Badge>
            </div>
            <p className="text-[11px] text-neutral-600">
              To test or mint defense digital assets, switch to an authorized Manager or Admin account below:
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              onClick={() => {
                connectPersona("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
                setIsMintRoleHelpOpen(false);
                setTimeout(() => setIsMintModalOpen(true), 300);
              }}
              className="w-full justify-between bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-10"
            >
              <span>Switch to Dr. P. Nair (Radar Manager)</span>
              <span className="font-mono text-[10px] text-neutral-400">0x3C44...93BC</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                connectPersona("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                setIsMintRoleHelpOpen(false);
                setTimeout(() => setIsMintModalOpen(true), 300);
              }}
              className="w-full justify-between border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-xs h-10"
            >
              <span>Switch to Primary Admin / Minter</span>
              <span className="font-mono text-[10px] text-neutral-500">0xf39F...2266</span>
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Decommission Confirmation Dialog */}
      <Dialog open={!!decommissionTokenId} onOpenChange={() => setDecommissionTokenId(null)}>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            <span>Confirm Asset Decommission</span>
          </DialogTitle>
          <DialogDescription>
            You are about to permanently burn and decommission digital asset token{" "}
            <span className="font-mono font-bold text-neutral-900">#{decommissionTokenId}</span>.
            This operation is completely irreversible on the blockchain.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setDecommissionTokenId(null)}
            disabled={decommissioning}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecommissionAsset(decommissionTokenId)}
            disabled={decommissioning}
          >
            {decommissioning ? "Burning On-Chain..." : "Confirm & Decommission"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default AssetsPage;
