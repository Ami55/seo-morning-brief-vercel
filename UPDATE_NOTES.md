# Email reliability update

This version improves scheduled-email failure handling:

- Production no longer reports a successful simulated delivery when `RESEND_API_KEY` is missing.
- Resend delivery is retried up to three times for temporary API or network failures.
- The cron endpoint returns `502` with `status: "email_failed"` when research succeeds but email delivery does not.
- Successful cron responses now report the stored email status rather than assuming an email was sent.

After deploying, confirm that `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, and `CRON_SECRET` are configured for the Production environment in Vercel.
