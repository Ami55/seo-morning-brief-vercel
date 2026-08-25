import React, { useState } from 'react';
import {
  Send,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
  FileCode,
  Eye,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { Briefing, DiscoveredItem, RecommendedAction } from '../types';

interface LatestBriefingViewProps {
  briefing: Briefing | null;
  onSendEmail: (briefingId: string) => Promise<void>;
  isSendingEmail: boolean;
}

export const LatestBriefingView: React.FC<LatestBriefingViewProps> = ({
  briefing,
  onSendEmail,
  isSendingEmail
}) => {
  const [viewMode, setViewMode] = useState<'editorial' | 'email' | 'plain'>('editorial');
  const [copied, setCopied] = useState(false);

  if (!briefing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Briefing Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Click the "Run Research Now" button in the top navigation to scan active Google docs, patents, and expert publications.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    if (briefing.plainText) {
      navigator.clipboard.writeText(briefing.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(briefing.researchCompletedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getActionBadge = (action: RecommendedAction) => {
    switch (action) {
      case 'Take action now':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200/70 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Immediate Action</span>;
      case 'Test':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Test in Staging</span>;
      case 'Share with the team':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200/70 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Share With Team</span>;
      case 'Update documentation':
        return <span className="bg-violet-50 text-violet-700 border border-violet-200/70 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Update Docs</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Monitor Only</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'google_official':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Official Google</span>;
      case 'patent_analysis':
        return <span className="bg-violet-50 text-violet-700 border border-violet-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Google Patent Analysis</span>;
      case 'expert_commentary':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Expert Perspective</span>;
      default:
        return <span className="bg-sky-50 text-sky-700 border border-sky-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Industry Signal</span>;
    }
  };

  // Combine items to show
  const allHighlightedItems = [
    ...(briefing.highPriorityHighlights || []),
    ...(briefing.googleOfficialUpdates || []),
    ...(briefing.industryAnalysis || []),
    ...(briefing.expertPerspectives || []),
    ...(briefing.patentWatch || [])
  ];

  // Deduplicate by ID
  const uniqueItems = Array.from(new Map(allHighlightedItems.map((item) => [item.id, item])).values());

  return (
    <div id="latest-briefing-container" className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
              Daily Intelligence Dossier
            </span>
            <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            {briefing.subject}
          </h2>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setViewMode('editorial')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'editorial' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Editorial View</span>
            </button>
            <button
              onClick={() => setViewMode('email')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'email' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Email Mockup</span>
            </button>
            <button
              onClick={() => setViewMode('plain')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'plain' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plain Text</span>
            </button>
          </div>

          <button
            id="send-now-btn"
            onClick={() => onSendEmail(briefing.id)}
            disabled={isSendingEmail}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingEmail ? 'Sending...' : 'Dispatch Email'}</span>
          </button>
        </div>
      </div>

      {/* Active Core Update Alert Banner */}
      {briefing.isUpdateActive && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-amber-950 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm">
            <h4 className="font-extrabold text-amber-900 text-sm mb-0.5">
              Active Search Algorithm / Core Ranking Rollout In Progress
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Google has acknowledged an ongoing ranking rollout. Do not make reactive technical overhauls during active volatility windows. Monitor Search Console query segments and await complete rollout before computing baseline impact.
            </p>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: EDITORIAL DASHBOARD */}
      {viewMode === 'editorial' && (
        <div className="space-y-6">
          
          {/* Executive Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Senior Executive Intelligence Summary</span>
            </h3>

            <div className="space-y-3 text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
              {briefing.executiveSummary.map((para, idx) => (
                <p key={idx} className="border-l-2 border-indigo-200 pl-3.5 py-0.5">
                  {para}
                </p>
              ))}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                <span className="text-slate-500 block text-[11px] font-medium">Reviewed Sources</span>
                <span className="text-lg font-extrabold text-slate-900">{briefing.sourcesCheckedCount}</span>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                <span className="text-slate-500 block text-[11px] font-medium">Stories Discovered</span>
                <span className="text-lg font-extrabold text-slate-900">{briefing.itemsDiscoveredCount}</span>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                <span className="text-slate-500 block text-[11px] font-medium">Selected Top Stories</span>
                <span className="text-lg font-extrabold text-indigo-600">{briefing.itemsSelectedCount}</span>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                <span className="text-slate-500 block text-[11px] font-medium">Delivery Status</span>
                <span className="text-sm font-bold text-emerald-700 capitalize flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" /> {briefing.status === 'sent' ? 'Delivered' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Story Breakdown Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Selected Intelligence Developments</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Scored &ge; 60/100</span>
            </div>

            {uniqueItems.map((item) => {
              const isHigh = item.relevanceScore >= 85;

              return (
                <div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(item.category)}
                      {isHigh && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200/70 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                          High Priority (Score: {item.relevanceScore})
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">
                        Via {item.sourceName} &bull; {item.evidenceLevel}
                      </span>
                    </div>

                    <a
                      href={item.originalSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                    >
                      Primary Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Title */}
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  {/* Structural 4-Part Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/60">
                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block text-xs uppercase tracking-wide">
                        What Happened / Confirmed Change:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{item.whatHappened}</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block text-xs uppercase tracking-wide">
                        Strategic Why It Matters:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{item.whyItMatters}</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block text-xs uppercase tracking-wide">
                        Practical SEO Implication:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{item.practicalSeoImplication}</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block text-xs uppercase tracking-wide">
                        Uncertainties &amp; Evidence Limits:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{item.whatRemainsUncertain || item.uncertainties}</p>
                    </div>
                  </div>

                  {/* Recommended Action Card */}
                  <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 sm:p-4 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Recommended Action:</span>
                      <span className="text-slate-700">{item.recommendedAction}</span>
                    </div>
                    {getActionBadge(item.recommendedAction)}
                  </div>

                  {/* Patent Specific Callout */}
                  {item.patentDetails && (
                    <div className="bg-violet-50/60 border border-violet-200/70 rounded-xl p-4 text-xs text-violet-950 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-violet-900">
                        <span>Patent Number: {item.patentDetails.publicationNumber}</span>
                        <span>Assignee: {item.patentDetails.assignee}</span>
                      </div>
                      <p><strong>Mechanism: </strong>{item.patentDetails.mechanismExplanation}</p>
                      <p className="text-[11px] text-violet-800 italic pt-1 border-t border-violet-200/50">
                        “{item.patentDetails.importantLimitations}”
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Matrix & Recommended Next Steps */}
          {briefing.recommendedActions && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recommended SEO Action Matrix</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Today */}
                <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40 space-y-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">Today (Immediate)</span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {briefing.recommendedActions.today?.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    )) || <li>No urgent actions needed today.</li>}
                  </ul>
                </div>

                {/* This Week */}
                <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">This Week</span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {briefing.recommendedActions.thisWeek?.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    )) || <li>Continue existing project sprints.</li>}
                  </ul>
                </div>

                {/* Monitor */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Monitor &amp; Track</span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {briefing.recommendedActions.monitor?.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    )) || <li>Track core rankings and volatility.</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Methodology & Safety Protocol */}
          <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>Editorial Integrity &amp; Strict Source Discipline</span>
            </h4>
            <p className="leading-relaxed">
              Every briefing synthesizes official documentation, patents, and community analysis with strict distinction between <strong>confirmed updates</strong>, <strong>isolated tests</strong>, and <strong>speculative opinions</strong>. Patents reflect filings, not active algorithmic ranking factors. Tracked thought leaders are indexed via legitimate public web search without private login bypass.
            </p>
          </div>

        </div>
      )}

      {/* VIEW MODE 2: HTML EMAIL PREVIEW */}
      {viewMode === 'email' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="text-xs text-slate-500">
              <strong>Previewing Delivered HTML Format</strong> (as rendered by Resend in recipient inbox)
            </div>
          </div>
          <div
            className="prose max-w-none border border-slate-200 rounded-xl p-4 sm:p-6 bg-slate-50/40 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: briefing.html }}
          />
        </div>
      )}

      {/* VIEW MODE 3: RAW PLAIN TEXT */}
      {viewMode === 'plain' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Plain-Text Email Output</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {briefing.plainText}
          </pre>
        </div>
      )}

    </div>
  );
};
