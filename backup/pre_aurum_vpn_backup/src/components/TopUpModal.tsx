import React, { useState } from 'react';
import { X, Wallet, Check, Copy, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';

interface TopUpModalProps {
  currentBalance: number;
  onClose: () => void;
  onTopUp: (amount: number, method: string) => void;
}

const PRESETS = [5, 10, 25, 50, 100];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  currentBalance,
  onClose,
  onTopUp
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<'instant' | 'crypto' | 'card'>('instant');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const amountToCharge = customAmount && parseFloat(customAmount) > 0
    ? parseFloat(customAmount)
    : selectedAmount;

  const cryptoAddress = 'TLx89P29uNmR7qB5e1w9kLz4hJ0xY7vQ8A';

  const handleCopyCrypto = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmTopUp = () => {
    if (amountToCharge <= 0) return;
    onTopUp(amountToCharge, method === 'instant' ? 'Instant Credit' : method === 'crypto' ? 'USDT TRC20' : 'Credit Card');
    setSuccessMsg(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0e1626] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Top up Checker Balance
              </h3>
              <p className="text-xs text-slate-400">
                Add verification credits. Deducted automatically per check.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Notice */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Current Balance</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            ${currentBalance.toFixed(4)}
          </span>
        </div>

        {/* Amount Selector */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Select Top-up Amount (USD)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PRESETS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  selectedAmount === amt && !customAmount
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <input
              type="number"
              step="any"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Or enter custom amount (e.g. 15)"
              className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Payment Method
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('instant')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                method === 'instant'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <span className="text-[11px] block">Instant Credit</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('crypto')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                method === 'crypto'
                  ? 'bg-cyan-500/15 border-cyan-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <span className="text-[11px] block">USDT (TRC20)</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                method === 'card'
                  ? 'bg-blue-500/15 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <span className="text-[11px] block">Card / Stripe</span>
            </button>
          </div>

          {method === 'crypto' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 mt-2">
              <span className="text-slate-400 text-[11px] block">
                Send exact USDT (TRC20 Network) to address:
              </span>
              <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-lg font-mono text-[11px] text-cyan-300">
                <span className="truncate">{cryptoAddress}</span>
                <button
                  onClick={handleCopyCrypto}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Button */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={handleConfirmTopUp}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {successMsg ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Balance Added Successfully!</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Confirm Top up (+${amountToCharge.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
