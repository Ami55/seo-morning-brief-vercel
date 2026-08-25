import React from 'react';
import {
  Sparkles,
  Send,
  Clock,
  Globe2,
  Lock,
  SearchCheck,
  CheckCircle2
} from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings | null;
  onOpenRunModal: () => void;
  onOpenTestEmailModal: () => void;
  isLocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenRunModal,
  onOpenTestEmailModal,
  isLocked
}) => {
  const deliveryTimeFormatted = settings?.deliveryTime || '07:00 AM';
  const timezoneFormatted = settings?.timezone || 'America/Vancouver';
  const recipient = settings?.recipientEmail || 'Configured Strategist';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shadow-md shadow-indigo-950/10 border border-slate-800">
              <SearchCheck className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  SEO Morning Brief
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Senior Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Automated Google Search, Patent &amp; Industry Briefings
              </p>
            </div>
          </div>

          {/* Center Info Pill (Schedule & Target) */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50/80 border border-slate-200/60 px-3.5 py-1.5 rounded-full text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-800">{deliveryTimeFormatted}</span>
              <span className="text-slate-400 text-[11px]">({timezoneFormatted.split('/')[1]?.replace('_', ' ') || timezoneFormatted})</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500">To:</span>
              <span className="font-medium text-slate-800 truncate max-w-[140px]">{recipient}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Test Email Button */}
            <button
              id="test-email-btn"
              onClick={onOpenTestEmailModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Send Test Email</span>
            </button>

            {/* Run Research Button */}
            <button
              id="run-research-btn"
              onClick={onOpenRunModal}
              disabled={isLocked}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-indigo-950 active:scale-98 transition-all cursor-pointer shadow-sm hover:shadow border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span>Pipeline Busy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Run Research Now</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
