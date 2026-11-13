import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Sparkles,
  RefreshCw,
  QrCode,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';
import { hstockApi } from '../services/hstockApi';
import { PaymentRequest, SystemSettings, AppUser } from '../types/hstock';

interface BinanceUsdtDepositModalProps {
  user: AppUser | null;
  settings: SystemSettings;
  onClose: () => void;
  onDepositSubmitted?: () => void;
  onOpenAuth: () => void;
}

const PRESET_AMOUNTS = [1, 5, 10, 20, 50, 100];

export const BinanceUsdtDepositModal: React.FC<BinanceUsdtDepositModalProps> = ({
  user,
  settings,
  onClose,
  onDepositSubmitted,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');

  // Deposit Form
  const [amountUsd, setAmountUsd] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('10');
  const [transactionId, setTransactionId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [blockchainResult, setBlockchainResult] = useState<any>(null);

  // Copy Feedback
  const [copiedAddress, setCopiedAddress] = useState(false);

  // History Tab
  const [deposits, setDeposits] = useState<PaymentRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reverifyingId, setReverifyingId] = useState<string | null>(null);

  const walletAddress = settings.usdtWalletAddress || '0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef';
  const network = settings.usdtNetwork || 'BNB Smart Chain (BEP20)';
  const minDeposit = settings.minDepositUsd || 1.0;
  const maxDeposit = settings.maxDepositUsd || 100.0;

  // Load user deposits
  useEffect(() => {
    if (user) {
      setLoadingHistory(true);
      hstockApi.getMyPayments().then((list) => {
        setDeposits(list);
        setLoadingHistory(false);
      }).catch(() => setLoadingHistory(false));
    }
  }, [user]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleAmountSelect = (val: number) => {
    setAmountUsd(val);
    setCustomAmount(val.toString());
    setError(null);
  };

  const handleCustomAmountChange = (valStr: string) => {
    setCustomAmount(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setAmountUsd(parsed);
      if (parsed < minDeposit || parsed > maxDeposit) {
        setError(`Amount must be between $${minDeposit} and $${maxDeposit} USDT.`);
      } else {
        setError(null);
      }
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    const num = parseFloat(customAmount);
    if (isNaN(num) || num < minDeposit || num > maxDeposit) {
      setError(`Deposit amount must be between $${minDeposit}.00 and $${maxDeposit}.00 USDT.`);
      return;
    }

    const cleanTx = transactionId.trim();
    if (!cleanTx) {
      setError('Please provide your BNB Smart Chain Transaction ID (TXID / TxHash).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setBlockchainResult(null);

    try {
      const res = await hstockApi.submitDeposit({
        amountUsd: num,
        transactionId: cleanTx
      });

      setSuccess(true);
      setBlockchainResult(res.blockchainVerification);
      setTransactionId('');
      if (onDepositSubmitted) onDepositSubmitted();

      // Refresh list
      hstockApi.getMyPayments().then(setDeposits).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Deposit submission failed. Please verify your TXID.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReverify = async (id: string) => {
    setReverifyingId(id);
    try {
      const res = await hstockApi.verifyTxOnBlockchain(id);
      setDeposits((prev) => prev.map((p) => (p.id === id ? res.payment : p)));
    } catch (err: any) {
      setError(err.message || 'Verification check failed');
    } finally {
      setReverifyingId(null);
    }
  };

  // Generate SVG QR code for the receiving wallet address
  // A clean QR representation using an SVG QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(walletAddress)}&color=0-0-0&bgcolor=ffffff&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0c1220] rounded-3xl border border-amber-500/30 shadow-2xl shadow-black my-6 p-5 sm:p-7 space-y-6"
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0 font-black">
            <span className="text-xl font-mono">₮</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Deposit USDT
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                BEP20 Network
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Direct On-Chain Blockchain Settlement &bull; BNB Smart Chain
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('deposit'); setSuccess(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'deposit'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Deposit USDT (BEP20)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Deposit History ({deposits.length})</span>
          </button>
        </div>

        {/* Tab 1: Deposit USDT */}
        {activeTab === 'deposit' && (
          <div className="space-y-5">
            {/* Receiving Wallet Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1627] to-slate-900 border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* QR Code */}
                <div className="w-32 h-32 rounded-2xl bg-white p-2 shrink-0 flex items-center justify-center shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="USDT BEP20 QR"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                      Receiving Wallet Address
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      BNB Smart Chain (BEP20)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 font-mono text-xs sm:text-sm text-amber-300 break-all select-all flex items-center justify-between gap-2">
                    <span>{walletAddress}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        copiedAddress
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? 'Address Copied!' : 'Copy Wallet Address'}</span>
                    </button>

                    <a
                      href={`https://bscscan.com/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 px-2 py-1"
                    >
                      <span>View on BscScan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Protocol Spec Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Currency</span>
                  <span className="font-bold text-white">USDT (Tether)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Network</span>
                  <span className="font-bold text-amber-400">BEP20 (BSC)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Min Deposit</span>
                  <span className="font-bold text-emerald-400 font-mono">${minDeposit}.00 USDT</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Max Deposit</span>
                  <span className="font-bold text-emerald-400 font-mono">${maxDeposit}.00 USDT</span>
                </div>
              </div>
            </div>

            {/* Success Message Banner */}
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Deposit Submitted Successfully!</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Your deposit of <strong>${amountUsd.toFixed(2)} USDT</strong> has been submitted.
                  {blockchainResult?.verified ? (
                    <span className="block mt-1 text-emerald-300 font-mono">
                      ✓ Blockchain confirmed ({blockchainResult.confirmations} block confirmations). Admin has been notified for wallet credit.
                    </span>
                  ) : (
                    <span className="block mt-1 text-slate-300">
                      Blockchain verification is pending block indexing. Status will update automatically.
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  View Deposit in History &rarr;
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Deposit Form */}
            <form onSubmit={handleSubmitDeposit} className="space-y-4">
              {/* Step 1: Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>1. Enter Deposit Amount (USDT)</span>
                  <span className="text-amber-400 font-mono">Limits: ${minDeposit} - ${maxDeposit}</span>
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        amountUsd === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ${amt} USDT
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative rounded-2xl bg-slate-950 border border-slate-700 focus-within:border-amber-400 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min={minDeposit}
                    max={maxDeposit}
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter custom amount between 1 and 100"
                    className="w-full bg-transparent text-sm font-mono text-white pl-8 pr-16 py-3 focus:outline-none"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-mono font-bold text-amber-400">
                    USDT
                  </div>
                </div>
              </div>

              {/* Step 2: Transaction ID (TXID) */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>2. Transaction Hash / TXID</span>
                  <span className="text-slate-500 font-normal">From Binance, Trust Wallet, MetaMask</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Paste 66-character TXID (e.g. 0x8f7a62d...)"
                  className="w-full bg-slate-950 text-xs sm:text-sm font-mono text-white p-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-amber-400 placeholder-slate-600"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Transfers are confirmed directly on the BNB Smart Chain. Duplicate TXIDs and fake submissions are automatically rejected.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying on BNB Smart Chain...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit ${amountUsd.toFixed(2)} USDT Deposit</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Deposit History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-slate-400">
                Your Past Deposits
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoadingHistory(true);
                  hstockApi.getMyPayments().then((l) => { setDeposits(l); setLoadingHistory(false); });
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {deposits.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                <Wallet className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No deposits submitted yet</p>
                <p className="text-xs text-slate-500">
                  Submit your first USDT deposit using the BEP20 wallet address.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono">
                          ${dep.amountUsd.toFixed(2)} USDT
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {dep.network || 'BEP20'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dep.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : dep.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {dep.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="font-mono">
                          TX: {dep.transactionId.slice(0, 10)}...{dep.transactionId.slice(-8)}
                        </span>
                        <span>{new Date(dep.createdAt).toLocaleDateString()}</span>
                        {dep.confirmations !== undefined && (
                          <span className="text-emerald-400 font-mono">
                            {dep.confirmations} confirmations
                          </span>
                        )}
                      </div>

                      {dep.rejectionReason && (
                        <p className="text-[11px] text-rose-400">
                          Reason: {dep.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://bscscan.com/tx/${dep.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-semibold"
                        title="View on BscScan"
                      >
                        <span>BscScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {dep.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleReverify(dep.id)}
                          disabled={reverifyingId === dep.id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                          title="Check blockchain confirmation status"
                        >
                          <RefreshCw className={`w-3 h-3 ${reverifyingId === dep.id ? 'animate-spin' : ''}`} />
                          <span>Re-check</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
