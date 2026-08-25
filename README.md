# SEO Morning Brief

A senior-level SEO intelligence web application and daily automated briefing engine that monitors official Google Search documentation, search-engine patent applications, industry publications, and expert commentary.

Every morning, the system discovers new and updated content, analyzes high-impact developments with the OpenAI Responses API (`gpt-5` with `web_search`), scores candidates across a 6-factor evaluation model, compiles an executive briefing, emails it via Resend, and archives it in a searchable database.

---

## Key Features

1. **Daily Intelligence Pipeline**: Discovers developments published or updated since the previous successful run.
2. **Official Google Sources**: Monitors Search Central Blog, Status Dashboard, Ranking Systems Guide, Core Updates guidance, Search Console docs, and structured data search galleries.
3. **Google Patent Watch**: Searches newly published or granted patents from Google LLC / Alphabet Inc. / DeepMind on IR, Query Fan-Out, Passage Ranking, and RAG. Strictly enforces the mandatory safety disclaimer:
   > *"A patent shows what a company has sought to protect, not necessarily what is currently used in Google Search."*
4. **Expert Tracking & Ethical Discovery**: Tracks Olaf Kopp, Lily Ray, Steve Toth, Koray Tuğberk Gübür, Aleyda Solis, and Donna Rougeau using legitimate public search indexing (`site:linkedin.com/posts/`) and author RSS feeds without login walls or session scraping.
5. **Senior SEO Scoring Formula (0-100)**:
   - SEO Impact (30%)
   - Source Authority (20%)
   - Novelty (15%)
   - Actionability (15%)
   - Evidence Quality (10%)
   - Senior Strategist Relevance (10%)
   - Items scoring $\ge 85$ marked as **High Priority**; minimum inclusion score $\ge 60$.
6. **Responsive HTML & Plain-Text Emails**: Styled with a warm neutral background, dark green headings (`#064e3b`), coral accent badges (`#ea580c`), clear primary source links, and mobile-first typography.
7. **Production Executive Dashboard**:
   - Latest Briefing (Editorial View, HTML Email Preview, Plain Text, PDF/Print)
   - Searchable Briefing Archive
   - Evaluated Candidate Stories with 6-Factor breakdown
   - Monitored Sources Manager (Add, edit, pause, delete, accessibility test)
   - Expert Profiles & Query Templates
   - Patent Watch & Information Retrieval Monitor
   - Timezone (`America/Vancouver`) & Schedule Settings
   - Run History & Sanitized Error Logs
   - "Run Research Now" Interactive Modal
   - "Send Test Email" Interactive Modal

---

## Required Environment Variables

Configure these server-side variables (defined in `.env.example`):

```env
# Required for OpenAI Responses API with web_search tools
OPENAI_API_KEY="sk-..."

# Required for daily email dispatch via Resend
RESEND_API_KEY="re_..."

# Email sender and recipient configuration
EMAIL_FROM="SEO Morning Brief <briefing@updates.yourdomain.com>"
EMAIL_TO="ameneh.saeednia@gmail.com"

# Secret token protecting the daily cron endpoint
CRON_SECRET="your-secure-cron-secret-key"

# App base URL for self-referencing links
APP_BASE_URL="https://your-domain.com"

# Added by the Vercel Upstash Redis integration
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

*Note: In development or demo mode, if API keys are not supplied, the application automatically uses high-precision fallback intelligence and simulated email delivery so all UI workflows remain functional.*

---

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env` and supply your API keys:
   ```bash
   cp .env.example .env
   ```

3. **Start Full-Stack Development Server**:
   ```bash
   npm run dev
   ```
   The application will boot at `http://localhost:3000`.

---

## Database Setup & Persistence

The deployed application uses Upstash Redis for persistent storage and an expiring distributed run lock. Connect an Upstash Redis database to the Vercel project; Vercel supplies its environment variables automatically. Local development falls back to in-memory data.

- **Sources**: Persists active publications, RSS feeds, priorities, and access methods.
- **Discovered Items**: Stores all evaluated candidates with score breakdowns and patent records.
- **Briefings**: Retains full HTML, plain text, item lists, and delivery IDs.
- **Runs & Logs**: Tracks execution history, duration, and sanitized error logs.

---

## Resend Email Setup

1. Sign up at [Resend](https://resend.com) and create an API key (`re_...`).
2. Verify your sending domain in the Resend dashboard.
3. Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`.
4. Use the **"Test Email"** button in the top navigation bar to send a verification briefing to your inbox.

---

## Daily Scheduler Setup (Cron)

The application exposes a secure endpoint for daily automated execution:

- **Endpoint**: `GET /api/cron/daily-brief`
- **Authorization**: `Authorization: Bearer ${CRON_SECRET}`

### Example Trigger via cURL:
```bash
curl -X POST "https://your-domain.com/api/cron/daily-brief" \
  -H "Authorization: Bearer your-secure-cron-secret-key" \
  -H "Content-Type: application/json"
```

### Setting up with Google Cloud Scheduler:
1. Open Google Cloud Scheduler in GCP Console.
2. Create a Job:
   - **Frequency**: `0 7 * * *` (Every day at 7:00 AM)
   - **Timezone**: `America/Vancouver` (or your configured timezone)
   - **Target type**: HTTP
   - **URL**: `https://your-app-url.run.app/api/cron/daily-brief`
   - **HTTP method**: `POST`
   - **HTTP Headers**: `Authorization: Bearer your-secure-cron-secret-key`

---

## How to Trigger a Test Run

1. Open the dashboard in your browser.
2. Click the orange **"Run Research Now"** button in the header.
3. Choose either **"Generate Only"** (preview before sending) or **"Generate & Email"** (deliver immediately).
4. Watch the real-time execution tracker as it scans feeds, runs the research engine, scores candidates, and synthesizes the briefing.

---

## LinkedIn Access Limitations & Compliance

To respect privacy laws, robots.txt, and terms of service:
- The system **never** uses login cookies, session hijacking, or private authentication bypasses.
- Tracked experts are discovered via **public Google Search indexing** (e.g. `site:linkedin.com/posts/ "Author Name"`) or through their official author blogs, RSS feeds, and newsletters.
- If a post is behind a login wall, the system logs: *"No publicly accessible recent post was found"* rather than fabricating content.

---

## Adding RSS Feeds or Newsletters

1. Go to the **Monitored Sources** tab.
2. Click **"Add Source"**.
3. Select Category (`Industry Publication`, `Official Google`, `Expert Commentary`) and Source Type (`RSS Feed`, `Newsletter`, etc.).
4. Enter the Base URL and the RSS/Atom Feed URL (e.g. `https://example.com/feed.xml`).
5. Click **"Test Access"** to verify feed connectivity.
6. Click **"Create Source"**.
