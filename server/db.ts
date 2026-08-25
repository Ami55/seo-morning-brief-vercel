import fs from 'fs';
import path from 'path';
import { AppSettings, Briefing, DiscoveredItem, Run, Source } from '../src/types.js';
import { DEFAULT_SOURCES } from './defaultSources.js';

interface DatabaseSchema {
  sources: Source[];
  discoveredItems: DiscoveredItem[];
  briefings: Briefing[];
  runs: Run[];
  settings: AppSettings;
  lock: {
    isLocked: boolean;
    lockedAt?: string;
    lockedBy?: string;
  };
  errorLogs: {
    id: string;
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    message: string;
    context?: string;
  }[];
}

const DB_KEY = 'seo-morning-brief:database:v1';
const LOCK_KEY = 'seo-morning-brief:run-lock:v1';
let memoryDatabase: DatabaseSchema | undefined;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function getDefaultSettings(): AppSettings {
  return {
    timezone: 'America/Vancouver',
    deliveryTime: '10:00',
    recipientEmail: process.env.EMAIL_TO || 'ameneh.saeednia@gmail.com',
    fromEmail: process.env.EMAIL_FROM || 'SEO Morning Brief <onboarding@resend.dev>',
    appBaseUrl: process.env.APP_BASE_URL || 'https://ais-dev-ezqavj6nl52thupjokqy4f-197119453669.us-west2.run.app',
    minScoreThreshold: 60,
    highPriorityThreshold: 85,
    autoSendOnCron: true,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5),
    hasResendKey: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5),
    hasCronSecret: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length > 3),
  };
}

function createInitialBriefing(): Briefing {
  const todayStr = new Date().toISOString().split('T')[0];
  const sampleItems: DiscoveredItem[] = [
    {
      id: 'item-seed-1',
      sourceId: 'src-google-status-history',
      sourceName: 'Google Search Ranking Updates History',
      title: 'Google August 2026 Core Update Rollout Completed Across All Data Centers',
      canonicalUrl: 'https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history',
      author: 'Google Search Central Team',
      publishedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
      discoveredAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      contentHash: 'hash-core-august-2026',
      summary: 'Google announced the formal completion of the multi-week August 2026 Core Update, targeting deep content authenticity and multi-perspective utility.',
      category: 'google_official',
      relevanceScore: 96,
      scoreFactors: {
        seoImpact: 98,
        sourceAuthority: 100,
        novelty: 95,
        actionability: 92,
        evidenceQuality: 100,
        seniorStrategistRelevance: 95
      },
      evidenceLevel: 'confirmed',
      isHighPriority: true,
      whatHappened: 'Google has finalized the global rollout of the August 2026 Core Update. The update updated the neural scoring pipelines across multilingual SERPs with heavy emphasis on verifiable first-hand evidence.',
      whyItMatters: 'Volatile shifts have settled. Any site currently experiencing ranking adjustments can now accurately conduct post-rollout performance analysis without interference from mid-flight rollout fluctuations.',
      whatIsConfirmed: 'The rollout concluded globally across all regions and languages as officially logged on the Search Status Dashboard history page.',
      whatRemainsUncertain: 'Specific weightings between user interaction feedback loops and topical authority graphs remain proprietary.',
      practicalSeoImplication: 'Do not make panic revisions. Perform a segment-by-segment audit of pages that gained vs lost impressions to identify information gain deficits.',
      recommendedAction: 'Take action now',
      originalSourceUrl: 'https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history',
      supportingSourceUrls: ['https://developers.google.com/search/docs/appearance/core-updates']
    },
    {
      id: 'item-seed-2',
      sourceId: 'src-google-patents',
      sourceName: 'Google Patents Search & Filings',
      title: 'US Patent Application: Query Fan-Out and Multi-Perspective Consensus Ranking in Generative Search',
      canonicalUrl: 'https://patents.google.com/patent/US20260189021A1/en',
      author: 'Alphabet Inc. / Google LLC',
      publishedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
      discoveredAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      contentHash: 'hash-patent-query-fanout',
      summary: 'Describes a mechanism for decomposing ambiguous or broad queries into sub-intent vectors, querying diverse document shards, and measuring entity consensus.',
      category: 'patent_analysis',
      relevanceScore: 88,
      scoreFactors: {
        seoImpact: 85,
        sourceAuthority: 95,
        novelty: 90,
        actionability: 82,
        evidenceQuality: 95,
        seniorStrategistRelevance: 90
      },
      evidenceLevel: 'patent_application',
      isHighPriority: true,
      whatHappened: 'The US Patent Office published a new Google patent application detailing systems and methods for decomposing primary queries into sub-questions (synthetic query generation) to synthesize multi-angle summaries.',
      whyItMatters: 'Demonstrates Google IR engineering architecture for information retrieval in generative interfaces (e.g. AI Overviews and AI Mode) and how entity consensus across independent domains influences source citation.',
      whatIsConfirmed: 'Google researchers filed this architecture for legal patent protection.',
      whatRemainsUncertain: 'Whether all described vector clustering pipelines are actively executing in standard live web indexing or reserved for specific generative answer modules.',
      practicalSeoImplication: 'Pages that directly provide distinct, citation-worthy data points and clear answers to sub-questions have a higher mathematical likelihood of being synthesized in fan-out query retrieval.',
      recommendedAction: 'Test',
      originalSourceUrl: 'https://patents.google.com/patent/US20260189021A1/en',
      patentDetails: {
        patentTitle: 'Query Fan-Out and Multi-Perspective Consensus Ranking in Generative Search',
        publicationNumber: 'US20260189021A1',
        filingDate: '2025-02-14',
        publicationDate: '2026-08-14',
        assignee: 'Google LLC',
        inventors: ['Dr. A. Vance', 'J. Chen', 'M. Kowalski'],
        mechanismExplanation: 'The system decomposes a search query into N sub-queries, executes parallel retrieval over document clusters, calculates cross-document entity agreements (consensus score), and filters out low-novelty repetitive paragraphs.',
        possibleSeoRelevance: 'Validates the strategic value of Information Gain SEO: providing unique facts and structured consensus points increases citation probability.',
        importantLimitations: 'A patent shows what a company has sought to protect, not necessarily what is currently used in Google Search.',
        sourceUrl: 'https://patents.google.com/patent/US20260189021A1/en'
      }
    },
    {
      id: 'item-seed-3',
      sourceId: 'src-kopp-marketing',
      sourceName: 'Olaf Kopp / Kopp Online Marketing',
      title: 'Vector Search, Entity Salience & Semantic Proximity in Modern Information Retrieval',
      canonicalUrl: 'https://www.kopp-online-marketing.com/olaf-kopp-4',
      author: 'Olaf Kopp',
      publishedAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
      discoveredAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
      contentHash: 'hash-olaf-vector-entities',
      summary: 'Deep analysis of how search engines integrate dense retrieval (embeddings) with classical sparse BM25 models and the importance of entity salience.',
      category: 'expert_commentary',
      relevanceScore: 82,
      scoreFactors: {
        seoImpact: 80,
        sourceAuthority: 90,
        novelty: 80,
        actionability: 85,
        evidenceQuality: 88,
        seniorStrategistRelevance: 88
      },
      evidenceLevel: 'analysis',
      isHighPriority: false,
      whatHappened: 'Olaf Kopp published a comprehensive technical breakdown on semantic proximity, explaining why superficial keyword stuffing fails in vector space where concept embeddings evaluate topical completeness.',
      whyItMatters: 'Provides senior SEO teams with a theoretical framework for building entity-first content models rather than relying purely on legacy keyword frequency.',
      whatIsConfirmed: 'Modern Google systems use hybrid retrieval (RankEmbed, MUM, Gemini models) alongside traditional inverted indexes.',
      whatRemainsUncertain: 'The exact mathematical cutoff where cosine similarity thresholds discard non-salient entity mentions.',
      practicalSeoImplication: 'Structure topic clusters around coherent entity relationships (subject-predicate-object) to establish unambiguous context.',
      recommendedAction: 'Share with the team',
      originalSourceUrl: 'https://www.kopp-online-marketing.com/olaf-kopp-4'
    }
  ];

  return {
    id: `briefing-${todayStr}`,
    researchStartedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    researchCompletedAt: new Date(Date.now() - 3600 * 1000 * 3.8).toISOString(),
    researchWindowStart: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    researchWindowEnd: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    status: 'generated',
    subject: `SEO Morning Brief — ${todayStr}`,
    executiveSummary: [
      'Google August 2026 Core Update rollout has officially completed; search results volatility has normalized across all regions.',
      'New Google Patent US20260189021A1 outlines query fan-out mechanics and multi-perspective consensus scoring in generative search synthesis.',
      'Semantic SEO analysis highlights importance of entity salience and hybrid dense/sparse retrieval over legacy keyword density.'
    ],
    highPriorityHighlights: sampleItems.filter((i) => i.isHighPriority),
    googleOfficialUpdates: sampleItems.filter((i) => i.category === 'google_official'),
    industryAnalysis: sampleItems.filter((i) => i.category === 'industry_publication'),
    expertPerspectives: sampleItems.filter((i) => i.category === 'expert_commentary'),
    patentWatch: sampleItems.filter((i) => i.category === 'patent_analysis'),
    practicalImplications: [
      'Content Strategy: Ensure topic hubs address verified sub-query intents with primary, non-derivative data to optimize for query fan-out retrieval.',
      'Technical SEO & Audits: Review post-Core Update Search Console performance now that the global rollout is locked.',
      'AI & Retrieval: Focus on entity relationships and schema reconciliation to reinforce brand knowledge graph clarity.'
    ],
    recommendedActions: {
      today: [
        'Export Search Console performance data for the last 28 days to benchmark post-core update traffic shifts.'
      ],
      thisWeek: [
        'Conduct a content gap review on core informational pages to identify missing sub-intents highlighted by generative fan-out models.',
        'Review schema markup on author and organization entities to ensure explicit machine-readable credentials.'
      ],
      monitor: [
        'Track AI Overviews appearance rates and citation frequency on top 100 revenue-driving queries.'
      ]
    },
    sources: [
      {
        name: 'Google Search Ranking Updates History',
        title: 'Google August 2026 Core Update Rollout Completed',
        url: 'https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history'
      },
      {
        name: 'Google Patents',
        title: 'US20260189021A1: Query Fan-Out and Multi-Perspective Consensus Ranking',
        url: 'https://patents.google.com/patent/US20260189021A1/en'
      },
      {
        name: 'Olaf Kopp Online Marketing',
        title: 'Vector Search, Entity Salience & Semantic Proximity in Modern IR',
        url: 'https://www.kopp-online-marketing.com/olaf-kopp-4'
      }
    ],
    researchNotes: [
      'LinkedIn direct expert feeds required web search indexing discovery in adherence with strict public access guidelines.',
      'All official Google documentation reviewed for material substance changes rather than cosmetic footer revisions.'
    ],
    html: '',
    plainText: '',
    itemIds: sampleItems.map((i) => i.id),
    sourcesCheckedCount: 18,
    itemsDiscoveredCount: 14,
    itemsSelectedCount: 3
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure default sources are present
      if (!parsed.sources || parsed.sources.length === 0) {
        parsed.sources = DEFAULT_SOURCES;
      }
      if (!parsed.settings) {
        parsed.settings = getDefaultSettings();
      }
      // Refresh key status from runtime env
      parsed.settings.hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5);
      parsed.settings.hasResendKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5);
      parsed.settings.hasCronSecret = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length > 3);
      if (process.env.EMAIL_TO) parsed.settings.recipientEmail = process.env.EMAIL_TO;
      if (process.env.EMAIL_FROM) parsed.settings.fromEmail = process.env.EMAIL_FROM;

      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, initializing defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    sources: DEFAULT_SOURCES,
    discoveredItems: [],
    briefings: [],
    runs: [],
    settings: getDefaultSettings(),
    lock: {
      isLocked: false
    },
    errorLogs: []
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to database file:', err);
  }
}

const legacyFileDb = {
  getSources(): Source[] {
    const data = loadDatabase();
    return data.sources;
  },

  getSourceById(id: string): Source | undefined {
    const data = loadDatabase();
    return data.sources.find((s) => s.id === id);
  },

  upsertSource(source: Source): Source {
    const data = loadDatabase();
    const index = data.sources.findIndex((s) => s.id === source.id);
    if (index >= 0) {
      data.sources[index] = source;
    } else {
      data.sources.push(source);
    }
    saveDatabase(data);
    return source;
  },

  deleteSource(id: string): boolean {
    const data = loadDatabase();
    const initialLen = data.sources.length;
    data.sources = data.sources.filter((s) => s.id !== id);
    saveDatabase(data);
    return data.sources.length < initialLen;
  },

  getDiscoveredItems(): DiscoveredItem[] {
    const data = loadDatabase();
    return data.discoveredItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  saveDiscoveredItems(items: DiscoveredItem[]): void {
    const data = loadDatabase();
    for (const item of items) {
      const idx = data.discoveredItems.findIndex((i) => i.id === item.id || i.canonicalUrl === item.canonicalUrl);
      if (idx >= 0) {
        data.discoveredItems[idx] = { ...data.discoveredItems[idx], ...item };
      } else {
        data.discoveredItems.push(item);
      }
    }
    saveDatabase(data);
  },

  getBriefings(): Briefing[] {
    const data = loadDatabase();
    return data.briefings.sort((a, b) => new Date(b.researchCompletedAt).getTime() - new Date(a.researchCompletedAt).getTime());
  },

  getLatestBriefing(): Briefing | undefined {
    const list = this.getBriefings();
    return list[0];
  },

  getBriefingById(id: string): Briefing | undefined {
    const data = loadDatabase();
    return data.briefings.find((b) => b.id === id);
  },

  saveBriefing(briefing: Briefing): Briefing {
    const data = loadDatabase();
    const index = data.briefings.findIndex((b) => b.id === briefing.id);
    if (index >= 0) {
      data.briefings[index] = briefing;
    } else {
      data.briefings.unshift(briefing);
    }
    saveDatabase(data);
    return briefing;
  },

  getRuns(): Run[] {
    const data = loadDatabase();
    return data.runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  getLatestSuccessfulRun(): Run | undefined {
    const runs = this.getRuns();
    return runs.find((r) => r.status === 'completed');
  },

  saveRun(run: Run): Run {
    const data = loadDatabase();
    const index = data.runs.findIndex((r) => r.id === run.id);
    if (index >= 0) {
      data.runs[index] = run;
    } else {
      data.runs.unshift(run);
    }
    saveDatabase(data);
    return run;
  },

  getSettings(): AppSettings {
    const data = loadDatabase();
    data.settings.hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5);
    data.settings.hasResendKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5);
    data.settings.hasCronSecret = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length > 3);
    return data.settings;
  },

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    const data = loadDatabase();
    data.settings = { ...data.settings, ...settings };
    saveDatabase(data);
    return data.settings;
  },

  acquireLock(lockedBy: string): boolean {
    const data = loadDatabase();
    if (data.lock.isLocked) {
      // Check if lock has been stale for more than 15 minutes
      if (data.lock.lockedAt) {
        const lockAge = Date.now() - new Date(data.lock.lockedAt).getTime();
        if (lockAge > 15 * 60 * 1000) {
          console.warn('Overriding stale run lock older than 15 minutes');
          data.lock = {
            isLocked: true,
            lockedAt: new Date().toISOString(),
            lockedBy
          };
          saveDatabase(data);
          return true;
        }
      }
      return false;
    }

    data.lock = {
      isLocked: true,
      lockedAt: new Date().toISOString(),
      lockedBy
    };
    saveDatabase(data);
    return true;
  },

  releaseLock(): void {
    const data = loadDatabase();
    data.lock = {
      isLocked: false
    };
    saveDatabase(data);
  },

  getLockStatus(): { isLocked: boolean; lockedAt?: string; lockedBy?: string } {
    const data = loadDatabase();
    return data.lock;
  },

  logError(level: 'error' | 'warn' | 'info', message: string, context?: string): void {
    const data = loadDatabase();
    data.errorLogs.unshift({
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    });
    // Keep last 100 logs
    if (data.errorLogs.length > 100) {
      data.errorLogs = data.errorLogs.slice(0, 100);
    }
    saveDatabase(data);
  },

  getErrorLogs(): { id: string; timestamp: string; level: 'error' | 'warn' | 'info'; message: string; context?: string }[] {
    const data = loadDatabase();
    return data.errorLogs || [];
  },

  clearErrorLogs(): void {
    const data = loadDatabase();
    data.errorLogs = [];
    saveDatabase(data);
  }
};

function createInitialDatabase(): DatabaseSchema {
  return {
    sources: DEFAULT_SOURCES,
    discoveredItems: [],
    briefings: [],
    runs: [],
    settings: getDefaultSettings(),
    lock: { isLocked: false },
    errorLogs: []
  };
}

function redisConfig(): { url: string; token: string } | undefined {
  const url = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
    || process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL
    || process.env.STORAGE_REST_API_URL
    || process.env.STORAGE_KV_REST_API_URL
    || process.env.STORAGE_URL;
  const token = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN
    || process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN
    || process.env.STORAGE_REST_API_TOKEN
    || process.env.STORAGE_KV_REST_API_TOKEN
    || process.env.STORAGE_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : undefined;
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error('Upstash Redis environment variables are not configured.');
  const response = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error(`Redis request failed with status ${response.status}.`);
  const payload = await response.json() as { result?: T; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

function refreshRuntimeSettings(data: DatabaseSchema): DatabaseSchema {
  data.settings ||= getDefaultSettings();
  data.sources = data.sources?.length ? data.sources : DEFAULT_SOURCES;
  data.discoveredItems ||= [];
  data.briefings ||= [];
  data.runs ||= [];
  data.errorLogs ||= [];
  data.lock ||= { isLocked: false };
  // Remove the original AI Studio demonstration briefing and its hard-coded stories.
  data.briefings = data.briefings.filter((briefing) =>
    !briefing.itemIds?.some((id) => id.startsWith('item-seed-'))
  );
  const liveItemIds = new Set(data.briefings.flatMap((briefing) => briefing.itemIds || []));
  data.discoveredItems = data.discoveredItems.filter((item) =>
    !item.id.startsWith('item-seed-') || liveItemIds.has(item.id)
  );
  // Migrate the original default schedule to 10:00 AM Vancouver time.
  if (data.settings.deliveryTime === '07:00') data.settings.deliveryTime = '10:00';
  data.settings.hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  data.settings.hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());
  data.settings.hasCronSecret = Boolean(process.env.CRON_SECRET?.trim());
  if (process.env.EMAIL_TO) data.settings.recipientEmail = process.env.EMAIL_TO;
  if (process.env.EMAIL_FROM) data.settings.fromEmail = process.env.EMAIL_FROM;
  if (process.env.APP_BASE_URL) data.settings.appBaseUrl = process.env.APP_BASE_URL;
  return data;
}

async function loadCloudDatabase(): Promise<DatabaseSchema> {
  if (!redisConfig()) {
    memoryDatabase ||= createInitialDatabase();
    return refreshRuntimeSettings(structuredClone(memoryDatabase));
  }
  const raw = await redisCommand<string | null>(['GET', DB_KEY]);
  if (!raw) {
    const initial = createInitialDatabase();
    await redisCommand(['SET', DB_KEY, JSON.stringify(initial)]);
    return refreshRuntimeSettings(initial);
  }
  return refreshRuntimeSettings(typeof raw === 'string' ? JSON.parse(raw) : raw);
}

async function saveCloudDatabase(data: DatabaseSchema): Promise<void> {
  if (!redisConfig()) {
    memoryDatabase = structuredClone(data);
    return;
  }
  await redisCommand(['SET', DB_KEY, JSON.stringify(data)]);
}

export const db = {
  async getSources() { return (await loadCloudDatabase()).sources; },
  async getSourceById(id: string) { return (await loadCloudDatabase()).sources.find((s) => s.id === id); },
  async upsertSource(source: Source) {
    const data = await loadCloudDatabase();
    const index = data.sources.findIndex((s) => s.id === source.id);
    index >= 0 ? data.sources[index] = source : data.sources.push(source);
    await saveCloudDatabase(data);
    return source;
  },
  async deleteSource(id: string) {
    const data = await loadCloudDatabase();
    const before = data.sources.length;
    data.sources = data.sources.filter((s) => s.id !== id);
    await saveCloudDatabase(data);
    return data.sources.length < before;
  },
  async getDiscoveredItems() {
    return (await loadCloudDatabase()).discoveredItems.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  },
  async saveDiscoveredItems(items: DiscoveredItem[]) {
    const data = await loadCloudDatabase();
    for (const item of items) {
      const index = data.discoveredItems.findIndex((i) => i.id === item.id || i.canonicalUrl === item.canonicalUrl);
      index >= 0 ? data.discoveredItems[index] = { ...data.discoveredItems[index], ...item } : data.discoveredItems.push(item);
    }
    await saveCloudDatabase(data);
  },
  async getBriefings() {
    return (await loadCloudDatabase()).briefings.sort((a, b) => Date.parse(b.researchCompletedAt) - Date.parse(a.researchCompletedAt));
  },
  async getLatestBriefing() { return (await this.getBriefings())[0]; },
  async getBriefingById(id: string) { return (await loadCloudDatabase()).briefings.find((b) => b.id === id); },
  async saveBriefing(briefing: Briefing) {
    const data = await loadCloudDatabase();
    const index = data.briefings.findIndex((b) => b.id === briefing.id);
    index >= 0 ? data.briefings[index] = briefing : data.briefings.unshift(briefing);
    await saveCloudDatabase(data);
    return briefing;
  },
  async getRuns() { return (await loadCloudDatabase()).runs.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)); },
  async getLatestSuccessfulRun() { return (await this.getRuns()).find((r) => r.status === 'completed'); },
  async saveRun(run: Run) {
    const data = await loadCloudDatabase();
    const index = data.runs.findIndex((r) => r.id === run.id);
    index >= 0 ? data.runs[index] = run : data.runs.unshift(run);
    await saveCloudDatabase(data);
    return run;
  },
  async getSettings() { return (await loadCloudDatabase()).settings; },
  async updateSettings(settings: Partial<AppSettings>) {
    const data = await loadCloudDatabase();
    data.settings = { ...data.settings, ...settings };
    await saveCloudDatabase(data);
    return refreshRuntimeSettings(data).settings;
  },
  async acquireLock(lockedBy: string) {
    if (!redisConfig()) {
      const data = await loadCloudDatabase();
      if (data.lock.isLocked) return false;
      data.lock = { isLocked: true, lockedAt: new Date().toISOString(), lockedBy };
      await saveCloudDatabase(data);
      return true;
    }
    return (await redisCommand<string | null>(['SET', LOCK_KEY, JSON.stringify({ lockedAt: new Date().toISOString(), lockedBy }), 'EX', 900, 'NX'])) === 'OK';
  },
  async releaseLock() {
    if (redisConfig()) await redisCommand(['DEL', LOCK_KEY]);
    else {
      const data = await loadCloudDatabase();
      data.lock = { isLocked: false };
      await saveCloudDatabase(data);
    }
  },
  async getLockStatus() {
    if (!redisConfig()) return (await loadCloudDatabase()).lock;
    const raw = await redisCommand<string | null>(['GET', LOCK_KEY]);
    return raw ? { isLocked: true, ...JSON.parse(raw) } : { isLocked: false };
  },
  async logError(level: 'error' | 'warn' | 'info', message: string, context?: string) {
    const data = await loadCloudDatabase();
    data.errorLogs.unshift({ id: `err-${Date.now()}`, timestamp: new Date().toISOString(), level, message, context });
    data.errorLogs = data.errorLogs.slice(0, 100);
    await saveCloudDatabase(data);
  },
  async getErrorLogs() { return (await loadCloudDatabase()).errorLogs; },
  async clearErrorLogs() {
    const data = await loadCloudDatabase();
    data.errorLogs = [];
    await saveCloudDatabase(data);
  }
};

void legacyFileDb;
