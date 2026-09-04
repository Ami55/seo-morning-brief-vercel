import { Request, Response } from 'express';
import { db } from './db.js';
import { executeFullResearchWorkflow, sendEmailAndRecord } from './research.js';

function vancouverDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
}

export async function handleDailyBriefCron(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  const configuredSecret = process.env.CRON_SECRET;

  // Verify bearer token
  if (!configuredSecret || configuredSecret.trim() === '') {
    // If not configured, reject unless in development
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({
        error: 'CRON_SECRET is not configured on the server.'
      });
      return;
    }
  } else {
    const expectedAuth = `Bearer ${configuredSecret}`;
    if (!authHeader || authHeader !== expectedAuth) {
      await db.logError('warn', 'Unauthorized attempt to trigger /api/cron/daily-brief', 'handleDailyBriefCron');
      res.status(401).json({
        error: 'Unauthorized. Invalid or missing Authorization Bearer token.'
      });
      return;
    }
  }

  // Vercel schedules in UTC. Two triggers cover Vancouver's PDT/PST offsets;
  // only the trigger that lands at 10:00 local time performs the daily run.
  const vancouverHour = Number(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    hour: '2-digit',
    hourCycle: 'h23'
  }).format(new Date()));
  if (vancouverHour !== 10) {
    res.status(200).json({
      status: 'timezone_skip',
      message: 'Skipped because it is not 10:00 AM in Vancouver.',
      vancouverHour
    });
    return;
  }

  // Idempotency check: has a briefing already been sent today?
  const settings = await db.getSettings();
  const latestRun = await db.getLatestSuccessfulRun();
  const now = new Date();
  const todayDateStr = vancouverDate(now);

  if (latestRun && latestRun.completedAt && vancouverDate(new Date(latestRun.completedAt)) === todayDateStr && latestRun.emailStatus === 'sent') {
    res.status(200).json({
      message: 'Briefing has already been successfully researched and sent for today.',
      status: 'idempotent_skip',
      latestRunId: latestRun.id,
      completedAt: latestRun.completedAt
    });
    return;
  }

  // A transient Resend failure must retry the already-generated briefing. If we
  // research again, the previous completed run advances the discovery window and
  // the retry can incorrectly contain no stories.
  if (latestRun && latestRun.completedAt && vancouverDate(new Date(latestRun.completedAt)) === todayDateStr && latestRun.emailStatus === 'failed' && latestRun.briefingId) {
    const existingBriefing = await db.getBriefingById(latestRun.briefingId);
    if (existingBriefing) {
      const retry = await sendEmailAndRecord(existingBriefing, settings.recipientEmail, settings.fromEmail);
      res.status(retry.success ? 200 : 502).json({
        status: retry.success ? 'email_retry_sent' : 'email_retry_failed',
        runId: latestRun.id,
        briefingId: existingBriefing.id,
        deliveryId: retry.deliveryId,
        error: retry.error
      });
      return;
    }
  }

  try {
    const result = await executeFullResearchWorkflow({
      triggeredBy: 'cron',
      sendEmailAfter: settings.autoSendOnCron,
      recipientEmail: settings.recipientEmail,
      fromEmail: settings.fromEmail
    });

    if (result.success) {
      const completedRun = (await db.getRuns()).find((run) => run.id === result.runId);
      if (settings.autoSendOnCron && completedRun?.emailStatus !== 'sent') {
        res.status(502).json({
          error: 'Research completed, but the scheduled email was not sent.',
          status: 'email_failed',
          runId: result.runId,
          briefingId: result.briefing?.id,
          emailStatus: completedRun?.emailStatus || 'unknown'
        });
        return;
      }
      res.status(200).json({
        message: 'Daily SEO morning briefing research completed successfully.',
        runId: result.runId,
        briefingId: result.briefing?.id,
        itemsSelected: result.briefing?.itemsSelectedCount,
        emailSent: completedRun?.emailStatus === 'sent',
        emailStatus: completedRun?.emailStatus
      });
    } else {
      res.status(500).json({
        error: 'Failed to complete scheduled morning brief.',
        safeMessage: result.error || 'Research failed during processing.',
        runId: result.runId
      });
    }
  } catch (err: any) {
    await db.logError('error', `Cron execution crashed: ${err.message || 'Unknown exception'}`, 'handleDailyBriefCron');
    res.status(500).json({
      error: 'Internal server error during scheduled brief execution.'
    });
  }
}
