import React, { useState } from 'react';
import { Layers, Search, Filter, ExternalLink, Award, ShieldAlert, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { DiscoveredItem, SourceCategory } from '../types';

interface CandidateStoriesViewProps {
  items: DiscoveredItem[];
}

export const CandidateStoriesView: React.FC<CandidateStoriesViewProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesScore = item.relevanceScore >= minScore;

    return matchesSearch && matchesCategory && matchesScore;
  });

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'google_official', label: 'Official Google' },
    { id: 'patent_analysis', label: 'Patent Analysis' },
    { id: 'industry_publication', label: 'Industry News' },
    { id: 'expert_commentary', label: 'Expert Perspectives' }
  ];

  return (
    <div id="candidate-stories-container" className="space-y-6">
      
      {/* Top Controls & Scoring Formula Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Evaluated Candidate Stories</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review candidate developments scored using the 6-factor Senior SEO Intelligence formula
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Min Score Filter */}
            <div className="flex items-center gap-2 text-xs bg-slate-50/80 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-600 font-medium">Min Score:</span>
              <span className="font-bold text-indigo-600">{minScore}+</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-16 accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Scoring Weights Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
          <div className="bg-indigo-50/60 text-indigo-950 p-2.5 rounded-xl border border-indigo-100">
            <span className="font-bold block">SEO Impact</span>
            <span className="text-indigo-600 font-medium">Weight: 30%</span>
          </div>
          <div className="bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200">
            <span className="font-bold block">Source Authority</span>
            <span className="text-slate-600 font-medium">Weight: 20%</span>
          </div>
          <div className="bg-sky-50/60 text-sky-950 p-2.5 rounded-xl border border-sky-100">
            <span className="font-bold block">Novelty</span>
            <span className="text-sky-600 font-medium">Weight: 15%</span>
          </div>
          <div className="bg-amber-50/60 text-amber-950 p-2.5 rounded-xl border border-amber-100">
            <span className="font-bold block">Actionability</span>
            <span className="text-amber-600 font-medium">Weight: 15%</span>
          </div>
          <div className="bg-rose-50/60 text-rose-950 p-2.5 rounded-xl border border-rose-100">
            <span className="font-bold block">Evidence Quality</span>
            <span className="text-rose-600 font-medium">Weight: 10%</span>
          </div>
          <div className="bg-violet-50/60 text-violet-950 p-2.5 rounded-xl border border-violet-100">
            <span className="font-bold block">Strategist Relevance</span>
            <span className="text-violet-600 font-medium">Weight: 10%</span>
          </div>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isExpanded = expandedItemId === item.id;
          const isHigh = item.relevanceScore >= 85;
          const isIncluded = item.relevanceScore >= 60;

          return (
            <div
              key={item.id}
              id={`candidate-item-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {item.sourceName}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          : isIncluded
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Score: {item.relevanceScore}/100 {isHigh ? '🔥 High Priority' : isIncluded ? '✓ Qualified' : 'Deprioritized'}
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize font-medium">
                      {item.category.replace('_', ' ')} &bull; {item.evidenceLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    <a
                      href={item.originalSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                    >
                      {item.title}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline shrink-0" />
                    </a>
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.summary || item.whatHappened}
                  </p>

                </div>

                {/* Score Dial & Toggle */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 block">Overall Score</span>
                    <span className={`text-xl font-extrabold ${isHigh ? 'text-rose-600' : isIncluded ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {item.relevanceScore}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Factor Breakdown' : 'Factor Breakdown'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Factor Breakdown Accordion */}
              {isExpanded && item.scoreFactors && (
                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl text-xs space-y-3">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Scoring Factor Decomposition (0-100)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">SEO Impact (30%):</span>
                      <span className="font-bold text-slate-900 ml-1.5">{item.scoreFactors.seoImpact}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">Authority (20%):</span>
                      <span className="font-bold text-slate-900 ml-1.5">{item.scoreFactors.sourceAuthority}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">Novelty (15%):</span>
                      <span className="font-bold text-slate-900 ml-1.5">{item.scoreFactors.novelty}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">Actionability (15%):</span>
                      <span className="font-bold text-slate-900 ml-1.5">{item.scoreFactors.actionability}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">Evidence Quality (10%):</span>
                      <span className="font-bold text-slate-900 ml-1.5">{item.scoreFactors.evidenceQuality}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">Strategist Relevance (10%):</span>
                      <span className="font-bold text-slate-900 ml-1.5">{item.scoreFactors.seniorStrategistRelevance}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <strong>Recommended Action:</strong> {item.recommendedAction} &bull; <strong>Practical Implication:</strong> {item.practicalSeoImplication}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
