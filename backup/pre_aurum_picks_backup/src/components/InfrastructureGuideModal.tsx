import React, { useState } from 'react';
import {
  X,
  Server,
  Globe,
  ShieldCheck,
  DollarSign,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface InfrastructureGuideModalProps {
  onClose: () => void;
}

export const InfrastructureGuideModal: React.FC<InfrastructureGuideModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c1122] border border-purple-800/60 shadow-2xl overflow-hidden brand-glow">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-purple-900/30 bg-[#0e162d] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl brand-gradient-bg text-white">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Email Infrastructure &amp; Deployment Guide
              </h3>
              <p className="text-xs text-slate-400">
                Setup guide for Custom Domains, MX Records, Webhooks &amp; Production Deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Important Notice */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-purple-200">How EXTRA MAIL Inbound Works</p>
              <p className="text-xs text-slate-300">
                EXTRA MAIL uses a hybrid architecture: (1) Out of the box, it connects to real-world disposable mail networks
                (1secmail API) allowing you to immediately receive real emails sent from Gmail, Outlook, or verification bots.
                (2) For your own custom domain, it includes a webhook endpoint (<code>/api/webhook/email</code>) ready for
                Cloudflare Email Routing, SendGrid, or Mailgun.
              </p>
            </div>
          </div>

          {/* Section 1: DNS & MX Records */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>1. Required DNS &amp; MX Records for Custom Domain</span>
            </h4>
            <p className="text-xs text-slate-400">
              To receive emails on your own domain (e.g., <code>@extramail.live</code>), configure the following DNS records
              at your domain registrar (Cloudflare, Namecheap, Route53):
            </p>

            <div className="bg-[#080d1c] border border-purple-900/40 rounded-xl overflow-x-auto p-3 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400">
                <span>Record Type</span>
                <span>Host / Name</span>
                <span>Value / Priority</span>
              </div>
              <div className="flex items-center justify-between text-purple-300">
                <span>MX</span>
                <span>@</span>
                <span>10 mx1.cloudflare.net (Priority: 10)</span>
              </div>
              <div className="flex items-center justify-between text-purple-300">
                <span>MX</span>
                <span>@</span>
                <span>20 mx2.cloudflare.net (Priority: 20)</span>
              </div>
              <div className="flex items-center justify-between text-indigo-300">
                <span>TXT (SPF)</span>
                <span>@</span>
                <span>v=spf1 ~all</span>
              </div>
            </div>
          </div>

          {/* Section 2: Inbound Webhook Endpoint */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>2. Webhook Inbound Integration (`/api/webhook/email`)</span>
            </h4>
            <p className="text-xs text-slate-400">
              When using Cloudflare Email Routing Workers or SendGrid Inbound Parse, set your forwarding webhook to:
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-300">
              <span>https://your-domain.com/api/webhook/email</span>
              <button
                onClick={() => handleCopy('https://your-domain.com/api/webhook/email', 'webhook')}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'webhook' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Payload Schema accepted: JSON or standard multipart form with <code>to</code>, <code>from</code>, <code>subject</code>, and <code>html</code>.
            </p>
          </div>

          {/* Section 3: Operating Costs Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>3. Operating Costs &amp; Scalability Analysis</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#090d1a] border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Cloudflare Email Routing</div>
                <div className="text-base font-extrabold text-emerald-400">$0 / month</div>
                <p className="text-[11px] text-slate-400">Free tier includes unlimited custom domain email routing to webhooks.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090d1a] border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Node.js Server / VPS</div>
                <div className="text-base font-extrabold text-indigo-400">$0 - $5 / mo</div>
                <p className="text-[11px] text-slate-400">Runs smoothly on free tiers (Render, Fly.io, Cloud Run) or a $5 VPS.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090d1a] border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Domain Registration</div>
                <div className="text-base font-extrabold text-purple-400">~$8 - $12 / yr</div>
                <p className="text-[11px] text-slate-400">Any .com, .net, or .live domain with DNS control.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Security & Anti-Abuse Standards */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Security &amp; Abuse Prevention Policy</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              EXTRA MAIL strictly prohibits using temporary mailboxes for unauthorized access, spamming, fraud, or circumventing
              legal identity checks. We never claim temporary disposable domains are real Google Gmail accounts. All incoming HTML
              is sanitized to prevent XSS attacks and drive-by malware downloads.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-purple-900/30 bg-[#0a0e1c] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
