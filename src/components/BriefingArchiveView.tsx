import React, { useState } from 'react';
import { Archive, Search, Calendar, ChevronRight, Eye, Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { Briefing } from '../types';

interface BriefingArchiveViewProps {
  briefings: Briefing[];
  onSelectBriefing: (briefing: Briefing) => void;
}

export const BriefingArchiveView: React.FC<BriefingArchiveViewProps> = ({
  briefings,
  onSelectBriefing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBriefings = briefings.filter((b) => {
    const matchesSearch =
      b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.executiveSummary.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.sources.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="briefing-archive-container" className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Briefing Archive</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search historical SEO intelligence briefings, algorithm updates, and patent watches
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search past briefings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Delivered</option>
            <option value="generated">Generated</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Briefings List */}
      {filteredBriefings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <Archive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No matching briefings found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredBriefings.map((b) => {
            const formattedDate = new Date(b.researchCompletedAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={b.id}
                id={`archive-item-${b.id}`}
                onClick={() => onSelectBriefing(b)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        b.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {b.status === 'sent' ? 'Delivered' : 'Ready'}
                    </span>
                    {b.isUpdateActive && (
                      <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        🚨 Core Update Active
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">
                      {formattedDate}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {b.subject}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {b.executiveSummary[0] || 'Intelligence briefing compiled for senior SEO strategy.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="font-bold text-slate-800 block">{b.itemsSelectedCount} items selected</span>
                    <span className="text-[11px] text-slate-400">{b.sourcesCheckedCount} sources reviewed</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition text-slate-500 shadow-2xs">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
