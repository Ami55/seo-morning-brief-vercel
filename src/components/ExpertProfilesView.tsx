import React from 'react';
import { Users, ExternalLink, ShieldCheck, Search, Rss, AlertCircle } from 'lucide-react';
import { Source } from '../types';

interface ExpertProfilesViewProps {
  sources: Source[];
}

export const ExpertProfilesView: React.FC<ExpertProfilesViewProps> = ({ sources }) => {
  const expertSources = sources.filter((s) => s.category === 'expert_commentary' || s.sourceType === 'expert');

  return (
    <div id="expert-profiles-container" className="space-y-6">
      
      {/* Header Banner & Strict Compliance Note */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Tracked SEO Experts &amp; Thought Leaders</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monitors verified publications, personal blogs, public newsletters, and openly indexed commentary.
            </p>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 text-xs text-slate-700 max-w-md">
            <strong className="text-indigo-900 font-bold block flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Ethical Discovery &amp; Compliance Protocol
            </strong>
            <span className="leading-relaxed">
              Direct authentication bypass or private scrapers are strictly prohibited. The intelligence pipeline uses legitimate public search indexing (e.g. <code>site:linkedin.com/posts/</code>) and verified author feeds.
            </span>
          </div>
        </div>
      </div>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expertSources.map((expert) => (
          <div
            key={expert.id}
            id={`expert-card-${expert.id}`}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{expert.name}</h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Priority Score: {expert.priority}/100
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-slate-200">
                  {expert.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {expert.notes || 'Monitored for algorithm analysis, semantic SEO, and technical insights.'}
              </p>

              {/* Public Query Template */}
              {expert.searchQueryTemplate && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px] font-mono text-slate-700 mb-3">
                  <span className="text-slate-400 block text-[10px] font-sans uppercase font-bold mb-0.5">
                    Public Discovery Query:
                  </span>
                  <span className="break-all">{expert.searchQueryTemplate}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={expert.baseUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Profile / Blog</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {expert.feedUrl && (
                <a
                  href={expert.feedUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <Rss className="w-3 h-3 text-indigo-500" />
                  <span>RSS Feed</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
