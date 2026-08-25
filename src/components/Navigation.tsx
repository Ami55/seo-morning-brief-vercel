import React from 'react';
import {
  FileText,
  Archive,
  Layers,
  Globe,
  Users,
  Search,
  Settings,
  History
} from 'lucide-react';

export type TabKey =
  | 'latest'
  | 'archive'
  | 'candidates'
  | 'sources'
  | 'experts'
  | 'patents'
  | 'settings'
  | 'history';

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  candidateCount?: number;
  sourcesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  candidateCount = 0,
  sourcesCount = 0
}) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    { key: 'latest', label: 'Latest Briefing', icon: FileText },
    { key: 'archive', label: 'Briefing Archive', icon: Archive },
    { key: 'candidates', label: 'Evaluated Stories', icon: Layers, badge: candidateCount > 0 ? candidateCount : undefined },
    { key: 'sources', label: 'Monitored Sources', icon: Globe, badge: sourcesCount > 0 ? sourcesCount : undefined },
    { key: 'experts', label: 'SEO Thought Leaders', icon: Users },
    { key: 'patents', label: 'Patent Watch', icon: Search },
    { key: 'history', label: 'Run History & Logs', icon: History },
    { key: 'settings', label: 'Schedule & Delivery', icon: Settings }
  ];

  return (
    <nav className="bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => onSelectTab(tab.key)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
