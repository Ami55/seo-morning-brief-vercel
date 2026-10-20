# Reliability repair — 20 October 2026

## Findings and changes
This archive contains source code, not production logs or environment variables. The precise cause of the recent outage cannot be confirmed from it alone.

- Source checks previously read and rewrote the entire growing Redis database for every source. They now use one batch update, preserving user-edited source fields. Existing history is retained; the database is still a single JSON record. Large databases may eventually need migration to separate records.
- Express 4 async routes previously had unhandled promise rejections (including Redis outages and failures before the cron's local try block). All async API routes now forward failures to an error handler and return HTTP 500 instead of leaving requests unresolved.
- Vercel without persistent storage previously silently used temporary instance memory. It now fails explicitly rather than appearing to save briefings that disappear on restart.
- Successful email retries now update the associated run, preventing subsequent scheduled retries from treating it as failed. Generate-only cron runs are also treated as complete for that day.
- The next research window now starts at the previous research window's end, avoiding a gap during execution.
- Stories saved by an interrupted run but never included in a briefing no longer count as previously covered.
- Invalid RSS dates and AI entries without a title, valid HTTP URL, or parseable date are discarded.
- Initial run-record creation is now covered by lock cleanup.

## Deployment
1. Extract this ZIP. Copy the contents of the project folder into the existing repository root (do not upload the ZIP itself or nest the project folder).
2. Commit and push. Wait for the Production deployment in Vercel to finish.
3. In Vercel Production environment variables, check:
   - CRON_SECRET
   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (the existing KV/STORAGE aliases in server/db.ts remain supported)
   - OPENAI_API_KEY (optional for RSS-only operation)
   - RESEND_API_KEY, EMAIL_TO, EMAIL_FROM
   - APP_BASE_URL
   Do not replace or clear the existing Redis database. Redeploy after environment changes.
4. Open the app and use Run Research Now → Generate Only. Check the new briefing and Run History.
5. When ready, use Generate & Email to verify actual delivery. No live email was sent during this repair.
6. In Vercel Cron Jobs, confirm the existing daily jobs are enabled and inspect invocation logs. The current code runs only during the 10 AM Vancouver hour, with a retry at 10:20; calling the cron endpoint at another hour intentionally returns timezone_skip. Use the app's manual button for testing outside that hour.
7. If a job still fails: inspect Vercel invocation logs for 401 (CRON_SECRET), storage errors (Upstash credentials/quota/payload), duration limits, OpenAI errors (credits/model/access), or Resend errors (credits/sender verification). These external conditions cannot be repaired inside this ZIP.

The existing schedule and model defaults were retained. No production settings, credentials, data, or live deployment were accessed.

## Validation
- npm run lint — passed
- npm run build — passed
- node --import tsx --test tests/reliability.test.ts — 2 regression tests passed
- Real OpenAI, Redis, Resend, and Vercel cron execution were not tested because production credentials and logs were not provided.
