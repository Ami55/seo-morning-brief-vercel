import React, { useState, useEffect } from 'react';
import { Settings, Save, Key, ShieldCheck, Mail, Clock, CheckCircle2, AlertTriangle, Terminal, Sliders } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings | null;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  isSaving: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  isSaving
}) => {
  const [timezone, setTimezone] = useState(settings?.timezone || 'America/Vancouver');
  const [deliveryTime, setDeliveryTime] = useState(settings?.deliveryTime || '07:00');
  const [recipientEmail, setRecipientEmail] = useState(settings?.recipientEmail || '');
  const [fromEmail, setFromEmail] = useState(settings?.fromEmail || '');
  const [minScoreThreshold, setMinScoreThreshold] = useState(settings?.minScoreThreshold || 60);
  const [highPriorityThreshold, setHighPriorityThreshold] = useState(settings?.highPriorityThreshold || 85);
  const [autoSendOnCron, setAutoSendOnCron] = useState(settings?.autoSendOnCron ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone);
      setDeliveryTime(settings.deliveryTime);
      setRecipientEmail(settings.recipientEmail);
      setFromEmail(settings.fromEmail);
      setMinScoreThreshold(settings.minScoreThreshold);
      setHighPriorityThreshold(settings.highPriorityThreshold);
      setAutoSendOnCron(settings.autoSendOnCron);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      timezone,
      deliveryTime,
      recipientEmail,
      fromEmail,
      minScoreThreshold: Number(minScoreThreshold),
      highPriorityThreshold: Number(highPriorityThreshold),
      autoSendOnCron
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="settings-view-container" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Delivery &amp; System Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure delivery schedule, email recipients, scoring sensitivity, and scheduler endpoints
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Email & Delivery Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email Delivery &amp; Distribution</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Recipient Email (Target Reader)
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="ameneh.saeednia@gmail.com"
                className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Where every daily morning briefing will be delivered.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sender Email (From Header)
              </label>
              <input
                type="text"
                required
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="SEO Morning Brief <briefing@updates.yourdomain.com>"
                className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Configured with your verified Resend sender domain.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule & Timezone Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Schedule &amp; Execution Time</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                User Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="America/Vancouver">America/Vancouver (Pacific Time - Default)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                <option value="America/New_York">America/New_York (ET)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Morning Delivery Time
              </label>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Default: 07:00 AM in {timezone}.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendOnCron}
                onChange={(e) => setAutoSendOnCron(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
              />
              <span>Automatically send email when scheduled Cron triggers</span>
            </label>
          </div>
        </div>

        {/* Scoring Sensitivity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Relevance Scoring Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Minimum Inclusion Score: <span className="text-indigo-600 font-extrabold">{minScoreThreshold}/100</span>
              </label>
              <input
                type="range"
                min="40"
                max="80"
                value={minScoreThreshold}
                onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Candidates below {minScoreThreshold} are deprioritized and filtered out of the morning brief.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                High Priority Threshold: <span className="text-rose-600 font-extrabold">{highPriorityThreshold}/100</span>
              </label>
              <input
                type="range"
                min="75"
                max="95"
                value={highPriorityThreshold}
                onChange={(e) => setHighPriorityThreshold(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Stories scoring {highPriorityThreshold}+ receive "🔥 High Priority" visual prominence.
              </p>
            </div>
          </div>
        </div>

        {/* API Keys & Environment Security */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span>Server Secrets &amp; Integration Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                <span>OPENAI_API_KEY</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${settings?.hasOpenAiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {settings?.hasOpenAiKey ? 'Active' : 'Fallback Engine'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Powers GPT-5.5 web search tool and senior intelligence synthesis.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                <span>RESEND_API_KEY</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${settings?.hasResendKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {settings?.hasResendKey ? 'Connected' : 'Simulation Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dispatches responsive HTML emails to {recipientEmail || 'recipients'}.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                <span>CRON_SECRET</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${settings?.hasCronSecret ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700'}`}>
                  {settings?.hasCronSecret ? 'Secured' : 'Dev Default'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Protects scheduled daily endpoint from unauthorized triggers.
              </p>
            </div>

          </div>
        </div>

        {/* Cron Endpoint Instructions */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-400">
            <Terminal className="w-4 h-4" />
            <span>Scheduled Execution Endpoint (Cloud Scheduler / Vercel Cron)</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Set up an automated cron trigger to hit this endpoint daily at 07:00 AM:
          </p>
          <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800">
            curl -X POST "{settings?.appBaseUrl || 'https://your-domain.com'}/api/cron/daily-brief" \<br />
            &nbsp;&nbsp;-H "Authorization: Bearer ${'{CRON_SECRET}'}" \<br />
            &nbsp;&nbsp;-H "Content-Type: application/json"
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-indigo-950 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-indigo-400" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
