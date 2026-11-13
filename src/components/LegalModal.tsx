import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Scale,
  ExternalLink
} from 'lucide-react';

interface LegalModalProps {
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'refund';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0c1220] rounded-3xl border border-amber-500/30 shadow-2xl p-5 sm:p-7 space-y-5 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <Scale className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-mono flex items-center gap-2">
                <span>HSTOCK LEGAL &amp; POLICIES</span>
                <span className="text-[10px] font-sans font-bold bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Official
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Terms of Service, Privacy Protection, and USDT Refund Guarantee
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

        {/* Tab navigation */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'terms' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'privacy' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'refund' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Refund Policy</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          
          {/* TAB 1: Terms of Service */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Last Updated: November 2026</span>
                <p className="text-slate-300">
                  These Terms of Service govern your use of the <strong>Hstock Commercial Account Checker</strong> platform. By registering an account, depositing funds via Binance USDT (BEP20), or executing verification batches, you agree to be bound by these Terms.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1. Permitted Commercial Use</span>
                </h4>
                <p>
                  Hstock is designed exclusively for legitimate digital marketers, media agencies, business auditors, and developers verifying public usernames, brand availability, influencer profile metrics, and account existence across supported platforms.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li>Maximum batch limit is strictly capped at <strong>2,000 accounts per run</strong> to respect server socket capacities and third-party infrastructure.</li>
                  <li>Users are strictly forbidden from attempting denial-of-service (DoS) attacks, brute-force cracking, credential stuffing, or scanning non-public private data.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>2. Platform API Restrictions &amp; Zero Fake Results Policy</span>
                </h4>
                <p>
                  Third-party platforms (such as Meta/Instagram, Facebook, TikTok, and Twitter/X) deploy proprietary anti-bot protections, login barriers, and rate thresholds.
                </p>
                <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  <strong>Strict Guarantee:</strong> Hstock never generates simulated, randomized, or fabricated results. When a platform server redirects a request via HTTP 302 to a login wall or throttles requests via HTTP 429, Hstock transparently flags the result as <strong>API_BLOCKED (302)</strong> or <strong>UNVERIFIED</strong>. An account is only categorized as <strong>ACCOUNT_FOUND (LIVE)</strong> or <strong>SUSPENDED</strong> when verified through authoritative evidence.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  <span>3. Pricing &amp; Wallet Debit Policies</span>
                </h4>
                <p>
                  Verification costs are billed in USD from your prepaid wallet balance based on the active pricing schedule set by the administrator. Balances are debited only when a verification batch is confirmed by the user. If an account check experiences a critical server failure, credits are eligible for dispute review.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>4. Service Availability &amp; Maintenance</span>
                </h4>
                <p>
                  Hstock strives for 99.9% uptime. Scheduled security upgrades and Cloudflare WAF maintenance may temporarily lock general checking. Admin reserves the right to toggle Maintenance Mode during infrastructure migrations.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Zero-Knowledge Architecture</span>
                <p className="text-slate-300">
                  Your privacy is paramount. Hstock operates under a strict privacy-first doctrine, ensuring that your target lists, user data, and payment receipts are handled with top-tier security standards.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>1. Zero Password Storage of Target Accounts</span>
                </h4>
                <p>
                  Hstock only queries public endpoints and official authorized APIs (Meta Graph API v19.0, YouTube Data API v3, TikTok oEmbed). We never ask for, collect, store, or process passwords, session cookies, or private login tokens of the accounts being checked.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>2. Cloudflare Edge WAF Protection &amp; Headers</span>
                </h4>
                <p>
                  All traffic to Hstock is proxied and filtered through Cloudflare edge servers. Security headers including <code className="text-cyan-300">X-Content-Type-Options: nosniff</code>, <code className="text-cyan-300">X-Frame-Options: SAMEORIGIN</code>, and Cloudflare Ray telemetry protect user data from man-in-the-middle interception.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>3. Customer Information Collected</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li><strong>Account Registration:</strong> Name, Email, and optional Mobile Number used solely for account authentication and wallet balance tracking.</li>
                  <li><strong>USDT Blockchain Records:</strong> Transaction IDs (TXID), sender wallet addresses, and on-chain verification logs queried via BNB Smart Chain RPC to ensure transparent crediting.</li>
                  <li><strong>Checking History:</strong> Batch records and CSV exports are retained in your private account history until you clear or delete them.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  <span>4. Third-Party Disclosures</span>
                </h4>
                <p>
                  We do not sell, rent, trade, or monetize your account lists or verification results to any third-party advertisers or data brokers.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Refund Policy */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">100% Transparent USDT Refund Policy</span>
                <p className="text-slate-300">
                  We believe in fair, customer-first commerce. Deposits are processed via Binance USDT on the BNB Smart Chain (BEP20) network, crediting your account 1:1 in USDT checker credits.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1. Unspent Balance Refunds (14-Day Window)</span>
                </h4>
                <p>
                  Any unused wallet balance in your Hstock account is <strong>100% refundable</strong> within 14 days of deposit. If you decide not to use the service, simply contact our support team at <strong className="text-white">03131664235</strong> or submit an in-app ticket with your registered email and TXID.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>2. Unverified Accounts Guarantee</span>
                </h4>
                <p>
                  If an account check batch fails due to server outages or unexpected platform downtime, or if an account cannot be queried at all, you may request a wallet credit adjustment.
                </p>
                <p className="text-slate-400">
                  <em>Note:</em> Transparent results showing <strong>ACCOUNT_NOT_FOUND (404)</strong> or <strong>API_BLOCKED (302)</strong> reflect genuine platform status and real telemetry, and are considered successfully delivered verification checks.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  <span>3. Rejected Payment Submissions</span>
                </h4>
                <p>
                  If a USDT deposit submission is rejected due to an invalid TXID, incorrect token contract, or unconfirmed transfer, you can re-submit with the correct TXID or reach out on WhatsApp at <strong className="text-white">03131664235</strong> for immediate resolution.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>4. How to Request a Refund</span>
                </h4>
                <p>
                  To request a refund, provide your registered email, receiving USDT (BEP20) wallet address, and original deposit TXID via WhatsApp to <strong>Muhammad Usman Yousaf (03131664235)</strong> or via the Customer Support modal. Refunds are typically processed within 2 to 24 hours.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Hstock Commercial Verification Platform &bull; Pakistan</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
