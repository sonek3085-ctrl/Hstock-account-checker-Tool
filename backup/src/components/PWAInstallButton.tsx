import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone app mode, hide prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#25f4ee]/20 to-[#fe2c55]/20 hover:from-[#25f4ee]/30 hover:to-[#fe2c55]/30 border border-[#25f4ee]/40 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-[#25f4ee]/10 ${className}`}
        title="Install TikBoost App on your phone or desktop"
      >
        <svg className="w-3.5 h-3.5 text-[#25f4ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-[#151724] border border-[#272b3d] hover:bg-[#1d2030] transition-all cursor-pointer inline-flex items-center gap-1.5 ${className}`}
          title="Install on iPhone / iPad"
        >
          <svg className="w-3.5 h-3.5 text-[#25f4ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#12141c] border border-[#272b3e] p-6 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fe2c55]/20 border border-[#fe2c55]/30 flex items-center justify-center text-[#fe2c55] font-bold text-xs">
                    TB
                  </div>
                  <h3 className="text-sm font-bold text-white">Install TikBoost on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0c0d12] border border-[#202436]">
                  <span className="w-5 h-5 rounded-full bg-[#25f4ee]/20 text-[#25f4ee] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <p>In Safari, tap the <strong>Share</strong> icon (square with arrow up) at the bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0c0d12] border border-[#202436]">
                  <span className="w-5 h-5 rounded-full bg-[#fe2c55]/20 text-[#fe2c55] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0c0d12] border border-[#202436]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                  <p>Tap <strong>&quot;Add&quot;</strong> in the top right. TikBoost will now launch like a native mobile app!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#25f4ee] hover:bg-[#20ddd7] rounded-xl cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
