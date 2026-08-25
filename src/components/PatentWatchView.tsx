import React from 'react';
import { Search, ExternalLink, ShieldAlert, BookOpen, Layers, Sparkles } from 'lucide-react';
import { DiscoveredItem } from '../types';

interface PatentWatchViewProps {
  items: DiscoveredItem[];
}

export const PatentWatchView: React.FC<PatentWatchViewProps> = ({ items }) => {
  const patentItems = items.filter((i) => i.category === 'patent_analysis' || i.patentDetails);

  return (
    <div id="patent-watch-container" className="space-y-6">
      
      {/* Safety Rule Banner */}
      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-violet-950">
            <h3 className="font-extrabold text-violet-900 text-sm mb-1">
              Google Patent Interpretation &amp; Safety Mandate
            </h3>
            <p className="mb-2.5 text-violet-800 leading-relaxed">
              Never describe a patent filing as proof that Google currently uses the described system in production ranking. The engine strictly distinguishes among <strong>patent descriptions</strong>, <strong>claims</strong>, <strong>possible SEO implications</strong>, and <strong>confirmed live systems</strong>.
            </p>
            <div className="bg-white/90 text-violet-950 p-3 rounded-xl font-semibold italic border border-violet-200 text-xs">
              “A patent shows what a company has sought to protect, not necessarily what is currently used in Google Search.”
            </div>
          </div>
        </div>
      </div>

      {/* Monitored IR & Patent Topics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Active Information Retrieval (IR) Research Topics</span>
        </h3>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            'Query Fan-Out',
            'Passage Ranking',
            'Synthetic Queries',
            'Entity Consensus',
            'Information Gain',
            'Vector Search',
            'Embeddings',
            'RAG Architectures',
            'Multimodal Retrieval',
            'User Interaction Signals',
            'Spam Detection',
            'Topical Authority'
          ].map((topic, i) => (
            <span key={i} className="bg-slate-100 text-slate-800 border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium">
              {topic}
            </span>
          ))}
          <span className="bg-violet-50 text-violet-800 border border-violet-200 font-bold px-2.5 py-1 rounded-lg">
            Assignees: Google LLC, Alphabet Inc., DeepMind
          </span>
        </div>
      </div>

      {/* Patent Items List */}
      <div className="space-y-4">
        {patentItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Patent Applications Recorded Yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Trigger a research run to discover newly published or granted Google Information Retrieval patents.
            </p>
          </div>
        ) : (
          patentItems.map((item) => (
            <div
              key={item.id}
              id={`patent-card-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-200">
                    {item.patentDetails?.publicationNumber || 'Patent Filing'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Assignee: {item.patentDetails?.assignee || 'Google LLC / Alphabet Inc.'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
                  Priority Score: {item.relevanceScore}/100
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                <a
                  href={item.originalSourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-violet-700 hover:underline inline-flex items-center gap-1.5"
                >
                  {item.title}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline shrink-0" />
                </a>
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                <p>
                  <strong>Mechanism Overview: </strong>
                  {item.patentDetails?.mechanismExplanation || item.whatHappened}
                </p>
                <p>
                  <strong>Possible Strategic SEO Relevance: </strong>
                  {item.patentDetails?.possibleSeoRelevance || item.practicalSeoImplication}
                </p>
                <div className="bg-violet-50/50 text-violet-950 p-3 rounded-xl border border-violet-100 text-xs italic">
                  <strong>Patent Limitation: </strong>
                  {item.patentDetails?.importantLimitations || 'A patent shows what a company has sought to protect, not necessarily what is currently used in Google Search.'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Discovered: {new Date(item.discoveredAt).toLocaleDateString()}</span>
                <a
                  href={item.originalSourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-violet-600 hover:text-violet-800 font-semibold"
                >
                  Inspect Google Patents Record &rarr;
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
