import React, { useState } from 'react';
import { Sparkles, Mail, Eye, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface RunResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (sendEmail: boolean) => Promise<void>;
  isRunning: boolean;
  progressStep: string;
  progressPercent: number;
}

export const RunResearchModal: React.FC<RunResearchModalProps> = ({
  isOpen,
  onClose,
  onRun,
  isRunning,
  progressStep,
  progressPercent
}) => {
  const [sendEmailAfter, setSendEmailAfter] = useState(false);

  if (!isOpen) return null;

  const handleStart = async () => {
    await onRun(sendEmailAfter);
  };

  const steps = [
    { label: 'Acquire Execution Lock & Inspect Sources', progress: 10 },
    { label: 'Scan Active Sources & RSS Feeds', progress: 30 },
    { label: 'OpenAI Responses API & Web Search', progress: 60 },
    { label: 'Deduplicate & 6-Factor Scoring', progress: 80 },
    { label: 'Synthesize Executive Briefing Dossier', progress: 95 },
    { label: 'Deliver Responsive Email (If Chosen)', progress: 100 }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        
        {/* Close button if not running */}
        {!isRunning && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold shadow-md shadow-slate-900/10 border border-slate-800">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Run SEO Research Engine</h3>
            <p className="text-xs text-slate-500">
              Discover, verify, and score developments since previous successful run
            </p>
          </div>
        </div>

        {isRunning ? (
          /* Running Progress State */
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {progressStep || 'Executing intelligence pipeline...'}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border border-slate-200/60 bg-slate-50/70 p-3.5 rounded-xl">
              {steps.map((s, idx) => {
                const isPassed = progressPercent >= s.progress;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isPassed ? 'text-indigo-600' : 'text-slate-300'
                      }`}
                    />
                    <span className={isPassed ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Execution Options Form */
          <div className="space-y-5 text-xs">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">Execution Scope:</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Inspects 18+ official Google docs, patents, and expert publications.</li>
                <li>Deduplicates against previous briefing archive items.</li>
                <li>Applies 60+ minimum relevance threshold &amp; 85+ high-priority filter.</li>
                <li>Generates responsive HTML email &amp; searchable archive record.</li>
              </ul>
            </div>

            {/* Email Choice Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSendEmailAfter(false)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  !sendEmailAfter
                    ? 'border-indigo-600 bg-indigo-50/40 text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-0.5 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Generate Only</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Preview in dashboard before emailing.
                </p>
              </div>

              <div
                onClick={() => setSendEmailAfter(true)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  sendEmailAfter
                    ? 'border-indigo-600 bg-indigo-50/40 text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-0.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Generate &amp; Email</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Send briefing to configured email upon completion.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-indigo-950 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Start Research Run</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
