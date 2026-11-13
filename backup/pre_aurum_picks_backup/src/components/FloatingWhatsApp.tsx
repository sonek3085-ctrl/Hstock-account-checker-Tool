import React from 'react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '03131664235',
}) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('92')
    ? cleanPhone
    : `92${cleanPhone.replace(/^0+/, '')}`;

  return (
    <aside
      aria-label="Direct WhatsApp Ordering Support"
      className="fixed bottom-5 right-5 z-40 group"
    >
      <a
        href={`https://wa.me/${internationalPhone}?text=${encodeURIComponent('Hello Admin, mujhe Digital Products ke baare mein maloomat chahiye.')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20"
      >
        <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
        </svg>
        <span className="hidden sm:inline font-bold text-xs">
          Order on WhatsApp
        </span>
      </a>
    </aside>
  );
};
