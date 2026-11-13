import React, { useRef } from 'react';
import { SocialPlatform, CheckMode, PRICING, PLATFORMS_CONFIG } from '../types/checker';
import { Play, Sparkles, Trash2, Upload, AlertCircle } from 'lucide-react';

interface AccountInputBoxProps {
  platform: SocialPlatform;
  mode: CheckMode;
  value: string;
  onChange: (val: string) => void;
  onStartCheck: () => void;
  isChecking: boolean;
  balance: number;
  onOpenTopUp: () => void;
}

export const AccountInputBox: React.FC<AccountInputBoxProps> = ({
  platform,
  mode,
  value,
  onChange,
  onStartCheck,
  isChecking,
  balance,
  onOpenTopUp
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse valid lines
  const lines = value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const count = lines.length;
  const isOverLimit = count > 2000;
  const unitPrice = mode === 'liveness' ? PRICING.liveness : PRICING.details;
  const totalCost = count * unitPrice;
  const hasInsufficientBalance = balance < totalCost && count > 0;

  const handleLoadSample = () => {
    const samples = PLATFORMS_CONFIG[platform].sampleInput;
    onChange(samples.join('\n'));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const existing = value.trim() ? value.trim() + '\n' : '';
        onChange(existing + content.trim());
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0e1524] border border-slate-800 shadow-xl space-y-4">
      
      {/* Top Header & Actions Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <span>Accounts (one per line, max 2000)</span>
            {isOverLimit && (
              <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Max 2000 exceeded
              </span>
            )}
          </label>
          <p className="text-xs text-slate-400">
            Paste usernames, @handles, or profile URLs (one entry per line).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Load Sample Button */}
          <button
            type="button"
            disabled={isChecking}
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Sample</span>
          </button>

          {/* Upload File Button */}
          <button
            type="button"
            disabled={isChecking}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload TXT/CSV</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Clear Button */}
          {count > 0 && (
            <button
              type="button"
              disabled={isChecking}
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition-all cursor-pointer"
              title="Clear all accounts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Textarea Input */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all bg-[#080d17]">
        <textarea
          rows={7}
          disabled={isChecking}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter accounts for ${PLATFORMS_CONFIG[platform].name} (e.g.):\n${PLATFORMS_CONFIG[platform].sampleInput.slice(0, 4).join('\n')}`}
          className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-600 font-mono p-4 focus:outline-none resize-y min-h-[160px] leading-relaxed"
        />
      </div>

      {/* Live Counter & Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        
        {/* Exact counters matching user prompt */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">Total:</span>
            <span className="text-sm font-extrabold text-white font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {count} {count === 1 ? 'account' : 'accounts'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">Cost:</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              ${totalCost.toFixed(4)}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 hidden md:inline">
            (${unitPrice.toFixed(4)} &times; {count})
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {hasInsufficientBalance ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Insufficient Balance
              </span>
              <button
                type="button"
                onClick={onOpenTopUp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Top up Balance
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isChecking || count === 0 || isOverLimit}
              onClick={onStartCheck}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                count === 0 || isOverLimit
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-95'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Verify Accounts ({count})</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
