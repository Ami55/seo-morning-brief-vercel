export type SourceType =
  | 'publication'
  | 'official_doc'
  | 'status_dashboard'
  | 'rss_feed'
  | 'expert'
  | 'linkedin_profile'
  | 'newsletter'
  | 'patent_query'
  | 'custom_url';

export type SourceStatus =
  | 'accessible'
  | 'rss_available'
  | 'search_only'
  | 'login_required'
  | 'blocked'
  | 'temporarily_unavailable';

export type AccessMethod = 'rss' | 'direct_page' | 'web_search' | 'sitemap';

export type SourceCategory =
  | 'google_official'
  | 'industry_publication'
  | 'expert_commentary'
  | 'patent_analysis'
  | 'technical_seo'
  | 'general';

export interface Source {
  id: string;
  name: string;
  sourceType: SourceType;
  baseUrl: string;
  feedUrl?: string;
  enabled: boolean;
  priority: number; // 1-100
  accessMethod: AccessMethod;
  lastCheckedAt?: string;
  lastSuccessfulCheckAt?: string;
  status: SourceStatus;
  category: SourceCategory;
  notes?: string;
  authorOrExpert?: string;
  searchQueryTemplate?: string;
}

export type EvidenceLevel =
  | 'confirmed'
  | 'supported'
  | 'analysis'
  | 'opinion'
  | 'patent_application';

export type RecommendedAction =
  | 'Take action now'
  | 'Monitor'
  | 'Test'
  | 'Share with the team'
  | 'Update documentation'
  | 'No action yet';

export interface ScoreFactors {
  seoImpact: number; // 30% (0-100)
  sourceAuthority: number; // 20% (0-100)
  novelty: number; // 15% (0-100)
  actionability: number; // 15% (0-100)
  evidenceQuality: number; // 10% (0-100)
  seniorStrategistRelevance: number; // 10% (0-100)
}

export interface PatentDetails {
  patentTitle: string;
  publicationNumber: string;
  filingDate?: string;
  publicationDate?: string;
  grantDate?: string;
  assignee: string;
  inventors?: string[];
  mechanismExplanation: string;
  possibleSeoRelevance: string;
  importantLimitations: string;
  sourceUrl: string;
}

export interface DiscoveredItem {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  canonicalUrl: string;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  discoveredAt: string;
  contentHash: string;
  summary: string;
  category: SourceCategory;
  relevanceScore: number; // 0-100
  scoreFactors?: ScoreFactors;
  evidenceLevel: EvidenceLevel;
  includedInBriefingId?: string;
  isHighPriority: boolean; // score >= 85
  isUpdatedSincePrevious?: boolean;
  whatHappened: string;
  whyItMatters: string;
  whatIsConfirmed: string;
  whatRemainsUncertain: string;
  practicalSeoImplication: string;
  recommendedAction: RecommendedAction;
  originalSourceUrl: string;
  supportingSourceUrls?: string[];
  patentDetails?: PatentDetails;
}

export interface Briefing {
  id: string;
  researchStartedAt: string;
  researchCompletedAt: string;
  researchWindowStart: string;
  researchWindowEnd: string;
  status: 'draft' | 'generated' | 'sent' | 'failed';
  subject: string;
  isUpdateActive?: boolean;
  activeUpdateName?: string;
  executiveSummary: string[]; // 3-5 bullets
  highPriorityHighlights: DiscoveredItem[];
  googleOfficialUpdates: DiscoveredItem[];
  industryAnalysis: DiscoveredItem[];
  expertPerspectives: DiscoveredItem[];
  patentWatch: DiscoveredItem[];
  practicalImplications: string[]; // 3-5 bullets for Content, Tech, Retrieval, etc.
  recommendedActions: {
    today: string[];
    thisWeek: string[];
    monitor: string[];
  };
  sources: {
    name: string;
    title: string;
    url: string;
  }[];
  researchNotes: string[];
  html: string;
  plainText: string;
  itemIds: string[];
  sentAt?: string;
  recipient?: string;
  error?: string;
  emailDeliveryId?: string;
  sourcesCheckedCount: number;
  itemsDiscoveredCount: number;
  itemsSelectedCount: number;
}

export interface Run {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  sourcesChecked: number;
  itemsDiscovered: number;
  itemsSelected: number;
  emailStatus: 'pending' | 'sent' | 'failed' | 'skipped';
  safeErrorMessage?: string;
  triggeredBy: 'cron' | 'manual';
  researchWindowStart: string;
  researchWindowEnd: string;
  briefingId?: string;
  logs?: string[];
}

export interface AppSettings {
  timezone: string; // e.g. "America/Vancouver"
  deliveryTime: string; // e.g. "07:00"
  recipientEmail: string;
  fromEmail: string;
  appBaseUrl: string;
  minScoreThreshold: number; // default 60
  highPriorityThreshold: number; // default 85
  autoSendOnCron: boolean;
  hasOpenAiKey: boolean;
  hasResendKey: boolean;
  hasCronSecret: boolean;
}

export interface ResearchProgressPayload {
  runId: string;
  step: string;
  status: 'running' | 'completed' | 'failed';
  progressPercent: number;
  message: string;
  briefingId?: string;
}
