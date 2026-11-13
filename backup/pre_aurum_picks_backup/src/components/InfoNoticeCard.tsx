import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, CheckCircle2, Ban, XCircle, Lock, HelpCircle } from 'lucide-react';

export const InfoNoticeCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm text-xs leading-relaxed space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading">
              Platform Verification Standards &amp; 5-Category Classification
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly verifies public account availability across Instagram, Facebook, and YouTube without fake simulations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 font-medium cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Standards & Category Rules'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          {/* 5 Categories Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-[11px]">
            {/* 1. Live */}
            <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. LIVE / ACTIVE</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                Account exists, profile is publicly available, and verified responsive.
              </p>
            </div>

            {/* 2. Suspended */}
            <div className="p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-rose-800 dark:text-rose-300">
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>2. SUSPENDED / DISABLED</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                Confirmed by reliable platform violation or termination notices.
              </p>
            </div>

            {/* 3. Not Found */}
            <div className="p-3 rounded-lg bg-red-50/70 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-red-800 dark:text-red-300">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>3. NOT FOUND</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                Account genuinely does not exist or profile is confirmed unavailable (HTTP 404).
              </p>
            </div>

            {/* 4. Private */}
            <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800/60 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-blue-800 dark:text-blue-300">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>4. PRIVATE ACCOUNTS</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                Account exists and is active, but content/profile is restricted to followers.
              </p>
            </div>

            {/* 5. Unknown */}
            <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-800 dark:text-amber-300">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>5. UNKNOWN / UNVERIFIED</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                Platform rate-limited (429) or requires login session. Never falsely reported as dead or suspended.
              </p>
            </div>
          </div>

          {/* Platform Verification Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                <span>Instagram Verification</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Queries Instagram web profile info endpoints and public profile metadata. Accurately distinguishes private accounts (<code>is_private: true</code>) from public live profiles, and flags checkpoint/login demands as UNKNOWN.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Facebook Verification</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Uses Facebook Page Plugin validation and direct header inspections. Detects unpublished/disabled notices (SUSPENDED), missing pages (NOT FOUND), and private group restrictions.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>YouTube Verification</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Validates handles (@name), channel IDs (UC...), and video links. Distinguishes live channels, community guideline terminations (SUSPENDED), and deleted content (404).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
