import React from 'react';
import { SocialPlatform } from '../types/checker';
import {
  Instagram,
  Twitter,
  Facebook,
  Video,
  AtSign,
  Mail,
  Infinity
} from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatform: SocialPlatform;
  onSelectPlatform: (platform: SocialPlatform) => void;
  disabled?: boolean;
}

interface PlatformOption {
  id: SocialPlatform;
  name: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  activeBorder: string;
  badge: string;
}

const PLATFORMS: PlatformOption[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    sub: '@handle or link',
    icon: Instagram,
    accentColor: 'from-pink-500 to-rose-600',
    activeBorder: 'border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10',
    badge: 'IG API'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    sub: 'page or user ID',
    icon: Facebook,
    accentColor: 'from-blue-600 to-indigo-600',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/10',
    badge: 'FB Graph'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    sub: '@username',
    icon: Video,
    accentColor: 'from-teal-400 to-cyan-500',
    activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/30 bg-cyan-500/10',
    badge: 'TT Fast'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    sub: '@handle or link',
    icon: Twitter,
    accentColor: 'from-sky-400 to-blue-500',
    activeBorder: 'border-sky-400 ring-2 ring-sky-400/30 bg-sky-500/10',
    badge: 'X Pro'
  },
  {
    id: 'threads',
    name: 'Threads',
    sub: '@handle',
    icon: AtSign,
    accentColor: 'from-purple-500 to-pink-500',
    activeBorder: 'border-purple-400 ring-2 ring-purple-400/30 bg-purple-500/10',
    badge: 'Meta'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    sub: 'user@gmail.com',
    icon: Mail,
    accentColor: 'from-red-500 to-amber-500',
    activeBorder: 'border-red-400 ring-2 ring-red-400/30 bg-red-500/10',
    badge: 'Google MX'
  },
  {
    id: 'meta',
    name: 'Meta',
    sub: 'Meta ID or handle',
    icon: Infinity,
    accentColor: 'from-blue-600 via-indigo-600 to-cyan-500',
    activeBorder: 'border-indigo-400 ring-2 ring-indigo-400/30 bg-indigo-500/10',
    badge: 'Meta ID'
  }
];

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelectPlatform,
  disabled = false
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
          <span>Platform</span>
          <span className="text-[10px] lowercase text-slate-500 font-normal">
            (select target network)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPlatform === p.id;

          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPlatform(p.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                isSelected
                  ? `${p.activeBorder} shadow-lg shadow-black/40`
                  : 'bg-[#101726] border-slate-800 hover:border-slate-700 hover:bg-[#141d30]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? `bg-gradient-to-tr ${p.accentColor} text-white shadow-md`
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                  {p.badge}
                </span>
              </div>

              <div>
                <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {p.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{p.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
