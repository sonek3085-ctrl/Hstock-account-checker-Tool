import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { hstockApi } from '../services/hstockApi';
import { AccountResult, SocialPlatform, CheckMode, SharedResultShare } from '../types/hstock';

interface ShareResultsModalProps {
  currentResults: AccountResult[];
  platform: SocialPlatform;
  mode: CheckMode;
  onClose: () => void;
}

export const ShareResultsModal: React.FC<ShareResultsModalProps> = ({
  currentResults,
  platform,
  mode,
  onClose
}) => {
  const [title, setTitle] = useState(`${platform.toUpperCase()} Account Verification Report`);
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(
    new Set(currentResults.map((r) => r.id))
  );
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active user shares
  const [myShares, setMyShares] = useState<SharedResultShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    setLoadingShares(true);
    hstockApi.getMyShares().then((list) => {
      setMyShares(list);
      setLoadingShares(false);
    }).catch(() => setLoadingShares(false));
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedResultIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedResultIds(next);
  };

  const handleSelectAll = () => {
    setSelectedResultIds(new Set(currentResults.map((r) => r.id)));
  };

  const handleDeselectAll = () => {
    setSelectedResultIds(new Set());
  };

  const handleGenerateShareLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = currentResults.filter((r) => selectedResultIds.has(r.id));
    if (chosen.length === 0) {
      setError('Please select at least 1 verified account result to share.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await hstockApi.createShareLink({
        title,
        platform,
        mode,
        results: chosen
      });

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${origin}?share=${res.shareId}`;
      setCreatedShareUrl(fullUrl);

      // Refresh list
      hstockApi.getMyShares().then(setMyShares).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to create shareable link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this shared link? Anyone visiting will no longer have access.')) return;
    setRevokingId(id);
    try {
      await hstockApi.revokeShareLink(id);
      setMyShares((prev) => prev.filter((s) => s.id !== id));
      if (createdShareUrl && createdShareUrl.includes(id)) {
        setCreatedShareUrl(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to revoke link');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0c1220] rounded-3xl border border-cyan-500/30 shadow-2xl shadow-black my-6 p-5 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <Share2 className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Share Verification Results
              </h2>
              <span className="text-[10px] uppercase font-bold bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                View-Only Public Link
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Secure client-safe sharing &bull; Private user credentials, balance &amp; deposit info are strictly redacted
            </p>
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Zero Information Leakage:</strong> Shared links never display email addresses, wallet balances, or account credentials. Viewers only see verified usernames and public status telemetry.
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generated Share Link Box */}
        {createdShareUrl && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Shareable Link Ready
              </span>
              <span className="text-[10px] font-mono text-slate-400">View-Only</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-between gap-2 font-mono text-xs text-slate-200 break-all select-all">
              <span className="truncate">{createdShareUrl}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(createdShareUrl)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}</span>
              </button>

              <a
                href={createdShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Form: Select Results to Share */}
        {currentResults.length > 0 ? (
          <form onSubmit={handleGenerateShareLink} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. VIP Instagram Handles Verification"
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Selection Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  Select Accounts to Include ({selectedResultIds.size} of {currentResults.length} selected)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">&bull;</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[11px] text-slate-400 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Items checklist */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-950/70 border border-slate-800">
                {currentResults.map((r) => {
                  const isChecked = selectedResultIds.has(r.id);
                  const isFound = r.status === 'ACCOUNT_FOUND' || r.status === 'LIVE';

                  return (
                    <label
                      key={r.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-slate-900 border border-slate-700/60' : 'hover:bg-slate-900/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-slate-200 truncate">
                          @{r.handle}
                        </span>
                        {r.name && (
                          <span className="text-[11px] text-slate-400 truncate">
                            ({r.name})
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFound
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedResultIds.size === 0}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Globe className="w-4 h-4" />
              <span>Generate Shareable View-Only Link ({selectedResultIds.size} accounts)</span>
            </button>
          </form>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs space-y-1">
            <p>No active verification results in the current session.</p>
            <p>Run a check batch first to select and share accounts.</p>
          </div>
        )}

        {/* Existing Shares History */}
        {myShares.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <span className="text-xs uppercase font-extrabold text-slate-400">
              Your Active Shared Links ({myShares.length})
            </span>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {myShares.map((s) => {
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const link = `${origin}?share=${s.id}`;

                return (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="font-bold text-white truncate">{s.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {s.accountsCount} accounts &bull; {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(link)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer"
                        title="Copy Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleRevoke(s.id)}
                        disabled={revokingId === s.id}
                        className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 cursor-pointer"
                        title="Revoke Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
