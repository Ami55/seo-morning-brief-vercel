import express, { Request, Response } from 'express';
import { handleDailyBriefCron } from './cron.js';
import { db } from './db.js';
import { sendBriefingEmail } from './email.js';
import { executeFullResearchWorkflow, fetchRssFeedItems, sendEmailAndRecord } from './research.js';
import { Source } from '../src/types.js';

export function createApiApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SEO Morning Brief',
      timestamp: new Date().toISOString()
    });
  });

  // --- BRIEFINGS API ---
  app.get('/api/briefings', async (req: Request, res: Response) => {
    const briefings = await db.getBriefings();
    res.json(briefings);
  });

  app.get('/api/briefings/latest', async (req: Request, res: Response) => {
    const latest = await db.getLatestBriefing();
    if (!latest) {
      res.status(404).json({ error: 'No briefings found.' });
      return;
    }
    res.json(latest);
  });

  app.get('/api/briefings/:id', async (req: Request, res: Response) => {
    const briefing = await db.getBriefingById(req.params.id);
    if (!briefing) {
      res.status(404).json({ error: 'Briefing not found.' });
      return;
    }
    res.json(briefing);
  });

  app.post('/api/briefings/:id/send', async (req: Request, res: Response) => {
    const briefing = await db.getBriefingById(req.params.id);
    if (!briefing) {
      res.status(404).json({ error: 'Briefing not found.' });
      return;
    }

    const { recipientEmail, fromEmail } = req.body;
    const result = await sendEmailAndRecord(briefing, recipientEmail, fromEmail);
    if (result.success) {
      res.json({ success: true, deliveryId: result.deliveryId, briefing });
    } else {
      res.status(500).json({ success: false, error: result.error || 'Failed to dispatch email.' });
    }
  });

  // --- SOURCES API ---
  app.get('/api/sources', async (req: Request, res: Response) => {
    const sources = await db.getSources();
    res.json(sources);
  });

  app.post('/api/sources', async (req: Request, res: Response) => {
    const sourceData = req.body as Source;
    if (!sourceData.name || !sourceData.baseUrl) {
      res.status(400).json({ error: 'Name and Base URL are required.' });
      return;
    }
    if (!sourceData.id) {
      sourceData.id = `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    }
    const saved = await db.upsertSource(sourceData);
    res.json(saved);
  });

  app.delete('/api/sources/:id', async (req: Request, res: Response) => {
    const success = await db.deleteSource(req.params.id);
    res.json({ success });
  });

  app.post('/api/sources/test-access', async (req: Request, res: Response) => {
    const { url, feedUrl } = req.body;
    if (!url && !feedUrl) {
      res.status(400).json({ error: 'URL or Feed URL required to test accessibility.' });
      return;
    }

    const targetUrl = feedUrl || url;
    try {
      if (feedUrl) {
        const dummySource: Source = {
          id: 'test',
          name: 'Test Source',
          sourceType: 'rss_feed',
          baseUrl: url || feedUrl,
          feedUrl,
          enabled: true,
          priority: 80,
          accessMethod: 'rss',
          category: 'industry_publication',
          status: 'accessible'
        };
        const items = await fetchRssFeedItems(dummySource);
        if (items.length > 0) {
          res.json({
            status: 'rss_available',
            accessible: true,
            itemCount: items.length,
            sampleTitle: items[0].title
          });
          return;
        }
      }

      // Check standard web access via fetch
      const testFetch = await fetch(targetUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'SEOMorningBriefBot/1.0' }
      });

      if (testFetch.ok || testFetch.status === 403 || testFetch.status === 401) {
        if (testFetch.status === 403 || testFetch.status === 401 || targetUrl.includes('linkedin.com/in')) {
          res.json({
            status: 'login_required',
            accessible: false,
            message: 'Direct page requires authentication. Will use ethical public search indexing discovery.'
          });
        } else {
          res.json({
            status: 'accessible',
            accessible: true,
            httpStatus: testFetch.status
          });
        }
      } else {
        res.json({
          status: 'temporarily_unavailable',
          accessible: false,
          httpStatus: testFetch.status
        });
      }
    } catch (err: any) {
      res.json({
        status: targetUrl.includes('linkedin.com') ? 'search_only' : 'temporarily_unavailable',
        accessible: false,
        message: err.message || 'Could not connect directly.'
      });
    }
  });

  // --- DISCOVERED ITEMS API ---
  app.get('/api/items', async (req: Request, res: Response) => {
    const items = await db.getDiscoveredItems();
    res.json(items);
  });

  // --- SETTINGS API ---
  app.get('/api/settings', async (req: Request, res: Response) => {
    const settings = await db.getSettings();
    res.json(settings);
  });

  app.post('/api/settings', async (req: Request, res: Response) => {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  });

  // --- RUNS & HISTORY API ---
  app.get('/api/runs', async (req: Request, res: Response) => {
    const runs = await db.getRuns();
    res.json(runs);
  });

  // --- MANUAL RESEARCH EXECUTION ---
  app.post('/api/research/run', async (req: Request, res: Response) => {
    const { sendEmailAfter, recipientEmail } = req.body;

    const lockStatus = await db.getLockStatus();
    if (lockStatus.isLocked) {
      res.status(409).json({
        error: 'A research run is already in progress.',
        lockStatus
      });
      return;
    }

    try {
      const result = await executeFullResearchWorkflow({
        triggeredBy: 'manual',
        sendEmailAfter: Boolean(sendEmailAfter),
        recipientEmail
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to complete research execution.'
      });
    }
  });

  // --- SECURE CRON SCHEDULED ENDPOINT ---
  app.get('/api/cron/daily-brief', handleDailyBriefCron);
  app.post('/api/cron/daily-brief', handleDailyBriefCron);

  // --- TEST EMAIL API ---
  app.post('/api/test-email', async (req: Request, res: Response) => {
    const { recipientEmail, fromEmail } = req.body;
    const latest = await db.getLatestBriefing();
    if (!latest) {
      res.status(400).json({ error: 'No briefing available to test email delivery.' });
      return;
    }

    const result = await sendBriefingEmail(latest, recipientEmail, fromEmail);
    res.json(result);
  });

  // --- ERROR LOGS API ---
  app.get('/api/errors', async (req: Request, res: Response) => {
    const logs = await db.getErrorLogs();
    res.json(logs);
  });

  app.post('/api/errors/clear', async (req: Request, res: Response) => {
    await db.clearErrorLogs();
    res.json({ success: true });
  });

  return app;
}
