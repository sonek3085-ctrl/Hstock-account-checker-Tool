import React, { useState } from 'react';
import { X, Shuffle, Edit3, Clock, Globe, Sparkles, Check } from 'lucide-react';
import { DomainOption } from '../types/email';

interface ChangeAddressModalProps {
  domains: { liveDomains: DomainOption[]; customDomains: DomainOption[] };
  currentDomain: string;
  onConfirm: (params: { username: string; domain: string; expiryMinutes: number }) => void;
  onClose: () => void;
}

export const ChangeAddressModal: React.FC<ChangeAddressModalProps> = ({
  domains,
  currentDomain,
  onConfirm,
  onClose,
}) => {
  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(currentDomain || domains.liveDomains[0]?.domain || '1secmail.com');
  const [expiryMinutes, setExpiryMinutes] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);

  const handleRandomize = () => {
    const prefixes = ['alpha', 'swift', 'delta', 'vivid', 'prime', 'shield', 'echo', 'shadow', 'zenith', 'pulse'];
    const words = ['fox', 'eagle', 'matrix', 'beacon', 'orbit', 'spark', 'flux', 'cipher', 'mail', 'node'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const w = words[Math.floor(Math.random() * words.length)];
    const n = Math.floor(100 + Math.random() * 900);
    setUsername(`${p}.${w}${n}`);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username.trim())) {
        setError('Username must be 3-30 characters (letters, numbers, dots, dashes).');
        return;
      }
    }
    onConfirm({
      username: username.trim(),
      domain: selectedDomain,
      expiryMinutes,
    });
  };

  const previewAddress = `${username.trim() || 'random_auto' }@${selectedDomain}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c1124] border border-purple-800/60 shadow-2xl overflow-hidden brand-glow">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-purple-900/30 bg-[#0e162d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg brand-gradient-bg text-white">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">
              Create / Change Address
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Custom Username Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Custom Address Prefix (Optional)
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Randomize</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. john.doe or leave empty for random"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>

          {/* Domain Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Inbound Domain:</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[...domains.liveDomains, ...domains.customDomains].map((d) => (
                <button
                  type="button"
                  key={d.domain}
                  onClick={() => setSelectedDomain(d.domain)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedDomain === d.domain
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="font-mono font-semibold truncate">@{d.domain}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {d.domain.includes('1sec') || d.domain.includes('qiott') || d.domain.includes('kzccv')
                      ? 'Live Public MX'
                      : 'Custom EXTRA MAIL'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Lifetime Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Inbox Expiration Timer:</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 10, label: '10 Minutes', desc: 'Quick OTP check' },
                { mins: 60, label: '1 Hour', desc: 'Standard (Recommended)' },
                { mins: 1440, label: '24 Hours', desc: 'Extended testing' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.mins}
                  onClick={() => setExpiryMinutes(opt.mins)}
                  className={`p-2.5 rounded-xl text-center border text-xs transition-all ${
                    expiryMinutes === opt.mins
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* New Address Preview */}
          <div className="p-3 rounded-xl bg-[#090d1a] border border-purple-900/40 text-xs">
            <span className="text-slate-400">Generated Address Preview: </span>
            <span className="font-mono text-purple-300 font-bold break-all">
              {previewAddress}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl brand-gradient-bg text-white hover:opacity-95 font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Inbox</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
