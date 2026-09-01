import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { LatestBriefingView } from './components/LatestBriefingView';
import { BriefingArchiveView } from './components/BriefingArchiveView';
import { CandidateStoriesView } from './components/CandidateStoriesView';
import { SourceManagerView } from './components/SourceManagerView';
import { ExpertProfilesView } from './components/ExpertProfilesView';
import { PatentWatchView } from './components/PatentWatchView';
import { SettingsView } from './components/SettingsView';
import { RunHistoryView } from './components/RunHistoryView';
import { RunResearchModal } from './components/RunResearchModal';
import { SendTestEmailModal } from './components/SendTestEmailModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AppSettings, Briefing, DiscoveredItem, Run, Source } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('latest');
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [candidateItems, setCandidateItems] = useState<DiscoveredItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [errorLogs, setErrorLogs] = useState<{ id: string; timestamp: string; level: 'error' | 'warn' | 'info'; message: string; context?: string }[]>([]);

  // Modals & Action States
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isRunningResearch, setIsRunningResearch] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const [briefingsRes, sourcesRes, itemsRes, settingsRes, runsRes, errorsRes] = await Promise.all([
        fetch('/api/briefings'),
        fetch('/api/sources'),
        fetch('/api/items'),
        fetch('/api/settings'),
        fetch('/api/runs'),
        fetch('/api/errors')
      ]);

      if (briefingsRes.ok) {
        const bList = await briefingsRes.json();
        setBriefings(bList);
        if (bList.length > 0 && !selectedBriefing) {
          setSelectedBriefing(bList[0]);
        }
      }

      if (sourcesRes.ok) {
        const sList = await sourcesRes.json();
        setSources(sList);
      }

      if (itemsRes.ok) {
        const iList = await itemsRes.json();
        setCandidateItems(iList);
      }

      if (settingsRes.ok) {
        const setts = await settingsRes.json();
        setSettings(setts);
      }

      if (runsRes.ok) {
        const rList = await runsRes.json();
        setRuns(rList);
      }

      if (errorsRes.ok) {
        const eList = await errorsRes.json();
        setErrorLogs(eList);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Poll updates every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Manual Run Trigger
  const handleRunResearch = async (sendEmailAfter: boolean) => {
    setIsRunningResearch(true);
    setProgressPercent(15);
    setProgressStep('Acquiring lock and querying monitored sources...');

    try {
      const controller = new AbortController();
      const requestTimeout = setTimeout(() => controller.abort(), 240000);
      // Simulate progressive progress updates for seamless user feedback
      const p1 = setTimeout(() => {
        setProgressPercent(45);
        setProgressStep('Scanning RSS feeds & running OpenAI Responses API with web search...');
      }, 1200);

      const p2 = setTimeout(() => {
        setProgressPercent(75);
        setProgressStep('Research is processing on the server; this can take up to 2 minutes...');
      }, 2600);

      const res = await fetch('/api/research/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          sendEmailAfter,
          recipientEmail: settings?.recipientEmail
        })
      });

      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(requestTimeout);

      const data = await res.json();

      if (data.success && data.briefing) {
        setProgressPercent(100);
        setProgressStep('Complete! Morning Brief ready.');
        setTimeout(() => {
          setIsRunningResearch(false);
          setIsRunModalOpen(false);
          loadData();
          setSelectedBriefing(data.briefing);
          setActiveTab('latest');
          showNotification(
            `✓ Morning brief generated! Selected ${data.briefing.itemsSelectedCount} high-priority items.`,
            'success'
          );
        }, 600);
      } else {
        setIsRunningResearch(false);
        setIsRunModalOpen(false);
        showNotification(data.error || 'Failed to complete research.', 'error');
      }
    } catch (err: any) {
      setIsRunningResearch(false);
      setIsRunModalOpen(false);
      showNotification(
        err.name === 'AbortError'
          ? 'The research request exceeded 4 minutes. Check Run History for the server result.'
          : 'Run error: ' + err.message,
        'error'
      );
    }
  };

  // Handle Send Briefing Email
  const handleSendEmail = async (briefingId: string) => {
    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/briefings/${briefingId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: settings?.recipientEmail,
          fromEmail: settings?.fromEmail
        })
      });
      const data = await res.json();

      if (data.success) {
        showNotification(`✓ Briefing successfully sent to ${settings?.recipientEmail}!`, 'success');
        loadData();
      } else {
        showNotification(`⚠️ Email delivery notice: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showNotification('Error sending email: ' + err.message, 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle Save Source
  const handleSaveSource = async (source: Source) => {
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source)
      });
      if (res.ok) {
        showNotification(`✓ Source "${source.name}" saved!`, 'success');
        loadData();
      }
    } catch (err: any) {
      showNotification('Error saving source: ' + err.message, 'error');
    }
  };

  // Handle Delete Source
  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this source from daily monitoring?')) return;
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Source removed', 'info');
        loadData();
      }
    } catch (err: any) {
      showNotification('Error deleting source: ' + err.message, 'error');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const saved = await res.json();
        setSettings(saved);
        showNotification('✓ Delivery settings updated successfully', 'success');
      }
    } catch (err: any) {
      showNotification('Error saving settings: ' + err.message, 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Clear Error Logs
  const handleClearErrors = async () => {
    try {
      await fetch('/api/errors/clear', { method: 'POST' });
      setErrorLogs([]);
      showNotification('Error logs cleared', 'info');
    } catch (err: any) {
      showNotification('Failed to clear errors', 'error');
    }
  };

  const staleRunCutoff = Date.now() - 6 * 60 * 1000;
  const isLocked = runs.some((r) =>
    r.status === 'running' && Date.parse(r.startedAt) >= staleRunCutoff
  ) || isRunningResearch;
  const latestBriefing = selectedBriefing || (briefings.length > 0 ? briefings[0] : null);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all transform duration-200 border ${
            notification.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : notification.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-indigo-900 text-white border-indigo-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header Bar */}
      <Header
        settings={settings}
        onOpenRunModal={() => setIsRunModalOpen(true)}
        onOpenTestEmailModal={() => setIsTestEmailModalOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        isLocked={isLocked}
      />

      {/* Main Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'latest' && briefings.length > 0) {
            setSelectedBriefing(briefings[0]);
          }
        }}
        candidateCount={candidateItems.length}
        sourcesCount={sources.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'latest' && (
          <LatestBriefingView
            briefing={latestBriefing}
            onSendEmail={handleSendEmail}
            isSendingEmail={isSendingEmail}
          />
        )}

        {activeTab === 'archive' && (
          <BriefingArchiveView
            briefings={briefings}
            onSelectBriefing={(b) => {
              setSelectedBriefing(b);
              setActiveTab('latest');
            }}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidateStoriesView items={candidateItems} />
        )}

        {activeTab === 'sources' && (
          <SourceManagerView
            sources={sources}
            onSaveSource={handleSaveSource}
            onDeleteSource={handleDeleteSource}
            onRefreshSources={loadData}
          />
        )}

        {activeTab === 'experts' && (
          <ExpertProfilesView sources={sources} />
        )}

        {activeTab === 'patents' && (
          <PatentWatchView items={candidateItems} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            isSaving={isSavingSettings}
          />
        )}

        {activeTab === 'history' && (
          <RunHistoryView
            runs={runs}
            errorLogs={errorLogs}
            onClearErrors={handleClearErrors}
          />
        )}
      </main>

      {/* Run Research Modal */}
      <RunResearchModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onRun={handleRunResearch}
        isRunning={isRunningResearch}
        progressStep={progressStep}
        progressPercent={progressPercent}
      />

      {/* Send Test Email Modal */}
      <SendTestEmailModal
        isOpen={isTestEmailModalOpen}
        onClose={() => setIsTestEmailModalOpen(false)}
        latestBriefing={latestBriefing}
        defaultRecipient={settings?.recipientEmail || 'ameneh.saeednia@gmail.com'}
        defaultFrom={settings?.fromEmail || 'SEO Morning Brief <onboarding@resend.dev>'}
      />

      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 SEO Morning Brief. Developed by <strong className="text-slate-700">Ami - SEO Girl</strong>. All rights reserved.</span>
          <span className="text-[11px] text-slate-400">
            OpenAI Web Research &bull; Resend Dispatch &bull; Google Patents Monitor
          </span>
        </div>
      </footer>

    </div>
  );
}
