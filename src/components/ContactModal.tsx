import React, { useState } from 'react';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Phone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Headphones,
  ExternalLink
} from 'lucide-react';
import { hstockApi } from '../services/hstockApi';

interface ContactModalProps {
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  onClose,
  userEmail = '',
  userName = ''
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Payment / Top-Up Inquiry');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'urgent'>('normal');

  const [loading, setLoading] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Why do some Instagram accounts show "API BLOCKED (302)" instead of Live or Suspended?',
      a: 'Meta/Instagram servers deploy bot barriers that redirect non-browser automated requests to "/login/?next=...". Hstock adheres to a strict Zero Fake Results policy: if Instagram redirects before returning profile metadata, we transparently mark it as API BLOCKED (302) with a 1-click in-browser verification link instead of guessing or faking a suspended status.'
    },
    {
      q: 'How long does Binance USDT (BEP20) deposit verification take?',
      a: 'USDT deposits on the BNB Smart Chain (BEP20) are verified automatically on-chain via our real-time BSC blockchain RPC node as soon as the transaction is confirmed on the network (typically 15 to 60 seconds). You can also click Verify Blockchain in your transaction panel.'
    },
    {
      q: 'Can I check up to 2,000 accounts in a single batch?',
      a: 'Yes! Hstock supports bulk lists of up to 2,000 accounts per run. The server divides accounts into parallel chunks with rate limiting to prevent network bans.'
    },
    {
      q: 'How do wallet refunds work?',
      a: 'Any unspent USDT wallet balance is eligible for refund or withdrawal. Simply message our WhatsApp support at 03131664235 or submit an in-app ticket with your registered email and TXID.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, email, and message details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await hstockApi.submitSupportTicket({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject,
        message: message.trim(),
        priority
      });
      setSuccessTicketId(res.ticket.id);
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit support ticket. Please reach out via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0c1220] rounded-3xl border border-amber-500/30 shadow-2xl p-5 sm:p-7 space-y-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <Headphones className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-mono flex items-center gap-2">
                <span>HSTOCK CUSTOMER SUPPORT</span>
                <span className="text-[10px] font-sans font-bold bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Online 24/7
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct WhatsApp, Phone, Email &amp; In-App Ticket Assistance
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

        {/* Global Notifications */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Direct Support Channels Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/923131664235?text=Hello%20Hstock%20Support%20Team%2C%20I%20need%20assistance%20with%20my%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Fastest Response
                  </span>
                  <span className="text-xs text-white font-bold group-hover:text-emerald-300 transition-colors">
                    WhatsApp Chat
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-2 block">
                0313 1664235 &rarr;
              </span>
            </a>

            {/* Direct Phone */}
            <a
              href="tel:03131664235"
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    Phone / WhatsApp
                  </span>
                  <span className="text-xs text-white font-bold group-hover:text-amber-300 transition-colors">
                    Muhammad Usman
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-2 block">
                0313 1664235
              </span>
            </a>

            {/* Direct Email */}
            <a
              href="mailto:usmanchandio079@gmail.com?subject=Hstock%20Account%20Checker%20Support"
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                    Official Email
                  </span>
                  <span className="text-xs text-white font-bold group-hover:text-cyan-300 transition-colors">
                    Support Desk
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-2 truncate block">
                usmanchandio079@gmail.com
              </span>
            </a>
          </div>

          {/* Ticket Submission Form */}
          {successTicketId ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Support Ticket Submitted!</h3>
              <p className="text-xs text-slate-300 font-mono">
                Ticket Reference: <strong className="text-emerald-300">{successTicketId}</strong>
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thank you for contacting Hstock. Our support team has logged your inquiry and will contact you via email or WhatsApp shortly.
              </p>
              <button
                type="button"
                onClick={() => setSuccessTicketId(null)}
                className="text-xs text-amber-400 underline font-medium hover:text-amber-300 pt-2 cursor-pointer"
              >
                Submit another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  Submit an In-App Support Ticket
                </h4>
                <span className="text-[10px] text-slate-500">
                  Average reply time: under 1 hour
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Muhammad Usman"
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Mobile / WhatsApp Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03131664235"
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Issue Category *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#080d18] text-xs text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Payment / Top-Up Inquiry">Binance USDT (BEP20) Deposit / Blockchain Status</option>
                    <option value="Account Checking Accuracy">Account Checking Accuracy / HTTP 302 Barrier</option>
                    <option value="Bulk Checking (2,000 Accounts)">Bulk Verification (Up to 2,000 Accounts)</option>
                    <option value="API Integration / Meta Graph Token">Meta Graph Token / API Setup</option>
                    <option value="Refund Request">Wallet Balance Refund Request</option>
                    <option value="Other Technical Query">Other Technical Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">Detailed Message *</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Priority:</span>
                    {(['low', 'normal', 'urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer ${
                          priority === p
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail (including Transaction ID or affected platform usernames)..."
                  className="w-full bg-[#080d18] text-xs text-white p-3.5 rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  By submitting, you agree to receive support communications from Hstock.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Interactive FAQs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Frequently Asked Questions
              </h4>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left text-xs font-bold text-white flex items-center justify-between gap-3 hover:bg-slate-850 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 font-sans">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Hstock Support &bull; Sindh / Punjab / Islamabad (PK)</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
