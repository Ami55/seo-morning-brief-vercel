import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  ExternalLink,
  Rss,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { AccessMethod, Source, SourceCategory, SourceStatus, SourceType } from '../types';

interface SourceManagerViewProps {
  sources: Source[];
  onSaveSource: (source: Source) => Promise<void>;
  onDeleteSource: (id: string) => Promise<void>;
  onRefreshSources: () => Promise<void>;
}

export const SourceManagerView: React.FC<SourceManagerViewProps> = ({
  sources,
  onSaveSource,
  onDeleteSource,
  onRefreshSources
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('publication');
  const [category, setCategory] = useState<SourceCategory>('industry_publication');
  const [priority, setPriority] = useState<number>(85);
  const [accessMethod, setAccessMethod] = useState<AccessMethod>('rss');
  const [notes, setNotes] = useState('');
  const [searchQueryTemplate, setSearchQueryTemplate] = useState('');

  const openCreateModal = () => {
    setEditingSource(null);
    setName('');
    setBaseUrl('');
    setFeedUrl('');
    setSourceType('publication');
    setCategory('industry_publication');
    setPriority(85);
    setAccessMethod('rss');
    setNotes('');
    setSearchQueryTemplate('');
    setIsModalOpen(true);
  };

  const openEditModal = (src: Source) => {
    setEditingSource(src);
    setName(src.name);
    setBaseUrl(src.baseUrl);
    setFeedUrl(src.feedUrl || '');
    setSourceType(src.sourceType);
    setCategory(src.category);
    setPriority(src.priority);
    setAccessMethod(src.accessMethod);
    setNotes(src.notes || '');
    setSearchQueryTemplate(src.searchQueryTemplate || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const source: Source = {
      id: editingSource ? editingSource.id : `src-${Date.now()}`,
      name,
      baseUrl,
      feedUrl: feedUrl.trim() ? feedUrl.trim() : undefined,
      sourceType,
      category,
      priority,
      accessMethod,
      enabled: editingSource ? editingSource.enabled : true,
      status: feedUrl ? 'rss_available' : 'accessible',
      notes: notes.trim() ? notes.trim() : undefined,
      searchQueryTemplate: searchQueryTemplate.trim() ? searchQueryTemplate.trim() : undefined,
      lastCheckedAt: editingSource?.lastCheckedAt,
      lastSuccessfulCheckAt: editingSource?.lastSuccessfulCheckAt
    };

    await onSaveSource(source);
    setIsModalOpen(false);
  };

  const handleToggleEnabled = async (src: Source) => {
    await onSaveSource({
      ...src,
      enabled: !src.enabled
    });
  };

  const handleTestAccessibility = async (src: Source) => {
    setTestingId(src.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/sources/test-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: src.baseUrl, feedUrl: src.feedUrl })
      });
      const data = await res.json();

      if (data.status === 'rss_available') {
        setTestResult({
          id: src.id,
          message: `✓ RSS verified (${data.itemCount} items parsed)`,
          success: true
        });
      } else if (data.status === 'accessible') {
        setTestResult({
          id: src.id,
          message: '✓ Public URL reachable (HTTP 200 OK)',
          success: true
        });
      } else if (data.status === 'login_required' || data.status === 'search_only') {
        setTestResult({
          id: src.id,
          message: 'ℹ️ Login wall detected. Handled via ethical public search indexing.',
          success: true
        });
      } else {
        setTestResult({
          id: src.id,
          message: `⚠️ Access note: ${data.message || 'Temporarily slow response'}`,
          success: false
        });
      }
    } catch (err: any) {
      setTestResult({
        id: src.id,
        message: '⚠️ Test failed: ' + err.message,
        success: false
      });
    } finally {
      setTestingId(null);
    }
  };

  const filteredSources = sources.filter((s) => {
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.baseUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'accessible':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Accessible
          </span>
        );
      case 'rss_available':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
            <Rss className="w-3 h-3" /> RSS Live
          </span>
        );
      case 'search_only':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 rounded-full">
            <Search className="w-3 h-3" /> Search Indexing
          </span>
        );
      case 'login_required':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Login Wall Protected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="source-manager-container" className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Monitored Intelligence Sources</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official Google endpoints, industry publications, patent databases, RSS feeds, and expert trackers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="google_official">Official Google</option>
            <option value="patent_analysis">Patent Analysis</option>
            <option value="industry_publication">Industry Publications</option>
            <option value="expert_commentary">Expert Commentaries</option>
          </select>

          {/* Add Source Button */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-indigo-950 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Status &amp; Name</th>
                <th className="py-3.5 px-4">Category / Type</th>
                <th className="py-3.5 px-4">Access Method</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Last Checked</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSources.map((src) => (
                <tr
                  key={src.id}
                  id={`source-row-${src.id}`}
                  className={`hover:bg-slate-50/60 transition-all ${!src.enabled ? 'opacity-50 bg-slate-50/40' : ''}`}
                >
                  {/* Name & URL */}
                  <td className="py-4 px-5">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleEnabled(src)}
                        className={`p-1.5 rounded-lg cursor-pointer mt-0.5 transition-all ${
                          src.enabled ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                        }`}
                        title={src.enabled ? 'Pause monitoring' : 'Enable monitoring'}
                      >
                        {src.enabled ? <Play className="w-3 h-3 fill-emerald-600" /> : <Pause className="w-3 h-3" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{src.name}</span>
                          {getStatusBadge(src.status)}
                        </div>

                        <a
                          href={src.baseUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-slate-400 hover:text-indigo-600 inline-flex items-center gap-1 mt-0.5"
                        >
                          <span className="truncate max-w-xs">{src.baseUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>

                        {src.notes && <p className="text-[11px] text-slate-500 mt-1">{src.notes}</p>}

                        {testResult && testResult.id === src.id && (
                          <div className={`mt-1.5 text-[11px] font-semibold ${testResult.success ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {testResult.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-[11px] capitalize">
                      {src.category.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 block text-[10px] mt-0.5 capitalize">
                      {src.sourceType.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Access Method */}
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                    {src.feedUrl ? (
                      <span className="text-indigo-700 flex items-center gap-1 font-semibold">
                        <Rss className="w-3 h-3" /> RSS Live
                      </span>
                    ) : (
                      <span className="capitalize">{src.accessMethod.replace('_', ' ')}</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-slate-900">{src.priority}</span>
                    <span className="text-slate-400 text-[10px]">/100</span>
                  </td>

                  {/* Last Checked */}
                  <td className="py-4 px-4 text-slate-500 text-[11px]">
                    {src.lastCheckedAt ? new Date(src.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTestAccessibility(src)}
                        disabled={testingId === src.id}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold cursor-pointer border border-slate-200/80"
                        title="Test accessibility"
                      >
                        {testingId === src.id ? 'Testing...' : 'Test'}
                      </button>

                      <button
                        onClick={() => openEditModal(src)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Edit Source"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteSource(src.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete Source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              {editingSource ? 'Edit Monitored Source' : 'Add New Intelligence Source'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Google Search Central Blog"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SourceCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="google_official">Official Google</option>
                    <option value="patent_analysis">Patent Analysis</option>
                    <option value="industry_publication">Industry Publication</option>
                    <option value="expert_commentary">Expert Commentary</option>
                    <option value="technical_seo">Technical SEO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as SourceType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="publication">Publication</option>
                    <option value="official_doc">Official Documentation</option>
                    <option value="status_dashboard">Status Dashboard</option>
                    <option value="rss_feed">RSS Feed</option>
                    <option value="expert">Expert Profile / Blog</option>
                    <option value="patent_query">Patent Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Base URL</label>
                <input
                  type="url"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RSS / Atom Feed URL (Optional)</label>
                <input
                  type="url"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  placeholder="https://.../feed.xml"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Weight (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Access Method</label>
                  <select
                    value={accessMethod}
                    onChange={(e) => setAccessMethod(e.target.value as AccessMethod)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="rss">RSS / Atom</option>
                    <option value="direct_page">Direct Webpage</option>
                    <option value="web_search">OpenAI Web Search</option>
                    <option value="sitemap">Sitemap Discovery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Strategic relevance notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-slate-900 hover:bg-indigo-950 text-white cursor-pointer shadow-xs"
                >
                  {editingSource ? 'Save Changes' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
