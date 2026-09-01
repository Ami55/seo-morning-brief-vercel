# Email reliability update

This version improves scheduled-email failure handling:

- Production no longer reports a successful simulated delivery when `RESEND_API_KEY` is missing.
- Resend delivery is retried up to three times for temporary API or network failures.
- The cron endpoint returns `502` with `status: "email_failed"` when research succeeds but email delivery does not.
- Successful cron responses now report the stored email status rather than assuming an email was sent.
- A timed-out function can no longer leave the dashboard permanently stuck on `Pipeline Busy`; fallback locks now expire automatically after 15 minutes.
- Orphaned run-history records left as `running` after a serverless timeout are automatically marked failed after 15 minutes, and the dashboard ignores stale running records.
- RSS feeds are checked concurrently instead of waiting up to eight seconds for each source in sequence.
- OpenAI web research now has a 90-second upper bound, allowing the workflow to continue with RSS results if the AI request times out.
- The browser request has a four-minute timeout and displays an actionable error instead of spinning forever.

After deploying, confirm that `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, and `CRON_SECRET` are configured for the Production environment in Vercel.
