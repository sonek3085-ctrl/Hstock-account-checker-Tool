import React from 'react';

export const FloatingFacebook: React.FC = () => {
  return (
    <aside
      aria-label="Official Facebook Page"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <a
        href="https://www.facebook.com/share/1ChLWZSUkD/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit us on Facebook"
        className="flex items-center gap-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-blue-600/30 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20 font-bold text-xs sm:text-sm cursor-pointer"
        title="Follow AURUM PICKS on Facebook"
      >
        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span className="hidden sm:inline">Follow on Facebook</span>
      </a>
    </aside>
  );
};
