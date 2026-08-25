import React from 'react';
import { Clock3, Database, Mail, Search, X } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { icon: Clock3, title: 'Runs every morning', text: 'Vercel Cron starts the briefing automatically each day. You can also run it manually at any time.' },
  { icon: Search, title: 'Researches current SEO developments', text: 'The pipeline checks monitored feeds and uses OpenAI web search to investigate recent Google, patent, industry, and expert updates.' },
  { icon: Database, title: 'Scores and saves the best findings', text: 'Stories are deduplicated, evaluated for authority, novelty, impact, and actionability, then archived securely in Redis.' },
  { icon: Mail, title: 'Builds and delivers your briefing', text: 'The app creates an executive summary with practical actions and sends the completed email through Resend.' }
];

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4" onClick={onClose}>
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">How SEO Morning Brief Works</h2>
            <p className="mt-1 text-sm text-slate-500">From live research to a concise daily email in four steps.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700"><Icon className="h-4 w-4" /></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Step {index + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-950">Got it</button>
        </div>
      </section>
    </div>
  );
};
