import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Users,
  Award,
  Zap,
  MessageCircle,
  Send,
  Calendar,
  LogOut,
  Mail,
  UserCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AppUser } from '../types/user';

interface UserAccountModalProps {
  user: AppUser;
  onClose: () => void;
  onLogout: () => void;
  onOpenShareModal?: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  user,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'reference' | 'referrals' | 'profile'>('reference');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Generate reference link URL with origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referenceUrl = `${origin}/?ref=${encodeURIComponent(user.referenceCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referenceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareText = `🚀 Check your Instagram, YouTube & Social Media accounts for FREE! Enter and create an account with my reference link to unlock bonus verification credits: ${referenceUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referenceUrl)}&text=${encodeURIComponent(
    `Free Social Media Account Status Checker - Reference by ${user.name}`
  )}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    referenceUrl
  )}&bgcolor=ffffff&color=0f172a`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                  {user.name}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {user.role === 'admin' ? 'PRO ADMIN' : 'MEMBER'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Code: <strong className="text-purple-600 dark:text-purple-400">{user.referenceCode}</strong> &bull; {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center divide-x divide-slate-100 dark:divide-slate-800">
          <div className="py-3 px-2">
            <span className="text-[11px] text-slate-400 block font-medium">Available Credits</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-amber-500 fill-current" />
              {user.credits}
            </span>
          </div>
          <div className="py-3 px-2">
            <span className="text-[11px] text-slate-400 block font-medium">Referred Accounts</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              {user.referralCount || user.referrals?.length || 0}
            </span>
          </div>
          <div className="py-3 px-2">
            <span className="text-[11px] text-slate-400 block font-medium">Referral Bonus Rate</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              +50 / user
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-5 gap-4">
          <button
            onClick={() => setActiveTab('reference')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'reference'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>My Reference Link</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'referrals'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Referred Network ({user.referrals?.length || user.referralCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Reference Link */}
          {activeTab === 'reference' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Your Unique Personal Reference Link</span>
                </div>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
                  Share this reference link with friends, creators, or buyers. When they enter the website and create an account, they get <strong>+25 welcome bonus checks</strong> and you instantly earn <strong>+50 verification checks</strong>!
                </p>
              </div>

              {/* Reference Link Input & Copy */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Shareable Reference URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referenceUrl}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-purple-700 dark:text-purple-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied Link!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quick Share to Socials &amp; Friends:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Telegram</span>
                  </a>

                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-colors shadow-xs"
                  >
                    <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{showQr ? 'Hide QR Code' : 'Show QR Code'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Card */}
              {showQr && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                  <img
                    src={qrUrl}
                    alt="QR Code for your reference link"
                    className="w-44 h-44 rounded-lg p-2 bg-white border border-slate-300 shadow-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Scan with any smartphone camera to open your reference link directly and register.
                  </p>
                </div>
              )}

              {/* Reference Info Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>How Reference Links Work:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>
                    When visitors enter your website via <strong>{referenceUrl}</strong>, the system detects your reference code.
                  </li>
                  <li>
                    When they complete account creation, your account automatically receives <strong>+50 free check credits</strong>.
                  </li>
                  <li>
                    Their name and registration time will appear under your <strong>Referred Network</strong> tab.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Referred Network */}
          {activeTab === 'referrals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Accounts Joined via Your Reference Link
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total {user.referrals?.length || user.referralCount || 0} user(s) created an account using your reference link.
                  </p>
                </div>
              </div>

              {user.referrals && user.referrals.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {user.referrals.map((ref, idx) => (
                    <div key={ref.id || idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {ref.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {ref.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{ref.email}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ref.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Zap className="w-3 h-3 fill-current" />
                          +{ref.bonusAwarded || 50} Credits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-50 dark:bg-slate-950">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-500 mx-auto flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No referred accounts yet
                    </h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Share your reference link on WhatsApp or social media. When someone enters and registers, they will appear here!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('reference')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Reference Link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Profile Details */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Full Name</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Email Address</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.email}</div>
                </div>

                {user.phone && (
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium">Phone Number</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.phone}</div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Reference Code</span>
                  <div className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                    {user.referenceCode}
                  </div>
                </div>

                {user.referredByName && (
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 space-y-1">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Referred By</span>
                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      {user.referredByName} (+25 welcome bonus applied)
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Account Created</span>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {new Date(user.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-2">
                <button
                  onClick={onLogout}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Balance: {user.credits} checks</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
