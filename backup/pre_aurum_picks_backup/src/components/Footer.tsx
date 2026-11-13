import React, { useState } from 'react';
import { Mail, Shield, FileText, Send, Check, X, Heart } from 'lucide-react';
import { mailApi } from '../services/mailApi';

interface FooterProps {
  onOpenGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await mailApi.submitContact({
        name: contactName,
        email: contactEmail,
        message: contactMsg,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setModalType(null);
        setContactName('');
        setContactEmail('');
        setContactMsg('');
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <footer className="mt-16 border-t border-purple-900/30 bg-[#070a16] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg brand-gradient-bg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-extrabold text-white font-heading tracking-tight">
                  EXTRA<span className="text-purple-400">MAIL</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                High-speed, disposable temporary email service protecting your primary inbox from spam, data leaks,
                and unwanted newsletters.
              </p>
            </div>

            {/* Col 2: Features */}
            <div className="space-y-2">
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Features</div>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li>Automatic 5-second inbox sync</li>
                <li>Instant OTP code detection</li>
                <li>Shareable reference links</li>
                <li>Military-grade HTML sanitization</li>
                <li>QR code mobile pairing</li>
              </ul>
            </div>

            {/* Col 3: Resources & Guides */}
            <div className="space-y-2">
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Resources</div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onOpenGuide} className="hover:text-purple-300 transition-colors">
                    Email Architecture &amp; MX Setup
                  </button>
                </li>
                <li>
                  <button onClick={() => setModalType('privacy')} className="hover:text-purple-300 transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setModalType('terms')} className="hover:text-purple-300 transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setModalType('contact')} className="hover:text-purple-300 transition-colors">
                    Contact &amp; Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Anti-Abuse Statement */}
            <div className="space-y-2">
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Compliance &amp; Trust</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                EXTRA MAIL does not host or impersonate Google Gmail accounts. All temporary addresses are generated on
                designated disposable domains with scheduled automatic record purging.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-purple-900/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} EXTRA MAIL Inc. All rights reserved. Built for security &amp; privacy.
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setModalType('privacy')} className="hover:text-slate-300">Privacy</button>
              <button onClick={() => setModalType('terms')} className="hover:text-slate-300">Terms</button>
              <button onClick={() => setModalType('contact')} className="hover:text-slate-300">Contact</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {modalType === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-[#0d1224] border border-purple-800/50 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-3 font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Privacy Policy</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <strong>Zero Personal Data Stored:</strong> EXTRA MAIL does not require registration, passwords, or personal
                identifying information.
              </p>
              <p>
                <strong>Automatic Data Purging:</strong> All temporary inboxes and received emails are ephemeral. When an inbox
                reaches its expiration time (10m, 1h, or 24h), all messages are permanently deleted from database storage.
              </p>
              <p>
                <strong>No Log Selling:</strong> We do not sell tracking profiles, IP addresses, or metadata to advertisers or
                data brokers.
              </p>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {modalType === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-[#0d1224] border border-purple-800/50 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-3 font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Terms of Service</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <strong>Acceptable Use:</strong> EXTRA MAIL is intended solely for protecting personal privacy, QA testing,
                and registering for legitimate web services.
              </p>
              <p>
                <strong>Prohibited Conduct:</strong> You agree not to use EXTRA MAIL for fraud, harassment, unauthorized access,
                or distribution of harmful materials.
              </p>
              <p>
                <strong>No Guarantee of Permanent Storage:</strong> As a disposable email service, inboxes are not archival.
                Do not use temporary addresses for critical recovery or banking accounts.
              </p>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {modalType === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0d1224] border border-purple-800/50 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 font-heading flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              <span>Contact EXTRA MAIL Support</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Have feedback, questions, or need custom domain setup assistance?</p>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Message Dispatched!</h4>
                <p className="text-xs text-slate-400">Our support engineers will review your inquiry shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Write your question or request..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                {submitError && <p className="text-rose-400 text-xs">{submitError}</p>}
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 brand-gradient-bg text-white font-semibold rounded-lg hover:opacity-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
