import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'otp';
  title: string;
  description?: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-250 ${
            toast.type === 'success'
              ? 'bg-[#0f1d1f]/95 border-emerald-500/50 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-[#241117]/95 border-rose-500/50 text-rose-200'
              : toast.type === 'otp'
              ? 'bg-[#181132]/95 border-purple-500/60 text-purple-200 brand-glow'
              : 'bg-[#0f172a]/95 border-indigo-500/50 text-indigo-200'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'otp' && <Sparkles className="w-5 h-5 text-purple-400 animate-spin-slow" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <h4 className="font-bold text-white text-sm">{toast.title}</h4>
            {toast.description && <p className="mt-0.5 opacity-90 leading-relaxed">{toast.description}</p>}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
