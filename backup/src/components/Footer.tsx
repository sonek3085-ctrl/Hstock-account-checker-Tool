import React from 'react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onOpenGuide,
}) => {
  const whatsappNumber = settings.adminWhatsApp || '03131664235';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('92')
    ? cleanPhone
    : `92${cleanPhone.replace(/^0+/, '')}`;

  return (
    <footer className="bg-[#050608] border-t border-amber-500/20 text-slate-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <span className="text-base font-black gold-gradient-text uppercase">
                {settings.storeName ? settings.storeName.split('-')[0].trim() : 'AURUM DIGITAL'}
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              {settings.storeTagline || 'Top-tier templates, social media assets, video packs & digital tools delivered directly to your WhatsApp.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${internationalPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs inline-flex items-center gap-1.5 hover:bg-emerald-900/50"
              >
                <span>WhatsApp: {whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-amber-300">
              Popular Digital Products
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400 hover:text-amber-300 transition-colors">TikTok Monetized Accounts</span></li>
              <li><span className="text-slate-400 hover:text-amber-300 transition-colors">Canva Pro Luxury Templates</span></li>
              <li><span className="text-slate-400 hover:text-amber-300 transition-colors">CapCut & Premiere Editing Packs</span></li>
              <li><span className="text-slate-400 hover:text-amber-300 transition-colors">E-Commerce & Dropshipping E-Books</span></li>
              <li><span className="text-slate-400 hover:text-amber-300 transition-colors">ChatGPT & Midjourney AI Prompts</span></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-amber-300">
              Management & Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Admin Panel Login
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenGuide}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  User Guide (استعمال کا طریقہ)
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${internationalPhone}?text=Support%20Help%20Needed`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  24/7 VIP Customer Support
                </a>
              </li>
              <li>
                <span className="text-slate-500">Secure 256-bit Digital Delivery</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings.storeName || 'AURUM DIGITAL'}. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-amber-400/80">
            <span>⚡ Instant Digital Delivery on WhatsApp: {whatsappNumber}</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
