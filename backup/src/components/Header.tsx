import React from 'react';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdmin,
  onOpenAdmin,
  onOpenGuide,
  onLogoutAdmin,
}) => {
  const whatsappNumber = settings.adminWhatsApp || '03131664235';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('92')
    ? cleanPhone
    : `92${cleanPhone.replace(/^0+/, '')}`;

  return (
    <header className="sticky top-0 z-40 bg-[#07080b]/95 backdrop-blur-md border-b border-amber-500/20">
      {/* Top Gold Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600/30 via-yellow-500/30 to-amber-600/30 border-b border-amber-500/30 py-1.5 px-4 text-center">
        <p className="text-[11px] sm:text-xs text-amber-200 font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span>{settings.announcement || '⚡ Special Offer: Instant WhatsApp Digital Delivery at 03131664235'}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0b10] rounded-[10px] flex items-center justify-center">
                <span className="text-xl">👑</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-extrabold tracking-tight gold-gradient-text uppercase">
                  {settings.storeName ? settings.storeName.split('-')[0].trim() : 'AURUM DIGITAL'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Store
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Premium Digital Assets & Accounts
              </p>
            </div>
          </a>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#12131a] hover:bg-[#1a1c26] border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Website aur Admin use karne ka tareeqa"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">User Guide</span>
              <span className="text-amber-400 text-[11px]">طریقہ</span>
            </button>

            {/* Direct WhatsApp Call/Chat */}
            <a
              href={`https://wa.me/${internationalPhone}?text=${encodeURIComponent('Hello! Mujhe Digital Products ke baare mein maloomat chahiye.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-emerald-600/90 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp:</span>
              <span className="font-mono text-[11px] sm:text-xs">{whatsappNumber}</span>
            </a>

            {/* Admin Login / Dashboard Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAdmin}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#14151e] border border-slate-800 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Admin Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
