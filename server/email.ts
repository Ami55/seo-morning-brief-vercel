import { Resend } from 'resend';
import { Briefing } from '../src/types.js';

export function generateBriefingHtml(briefing: Briefing): string {
  const formattedDate = new Date(briefing.researchCompletedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const renderItemList = (items: typeof briefing.highPriorityHighlights) => {
    if (!items || items.length === 0) {
      return '<p style="font-size: 14px; color: #78716c; font-style: italic; margin: 8px 0 16px 0;">No new items in this section for the current research window.</p>';
    }

    return items
      .map((item) => {
        const patentBlock = item.patentDetails
          ? `
          <div style="background-color: #fff7ed; border-left: 3px solid #ea580c; padding: 12px 14px; margin: 12px 0; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #9a3412;">
              📋 Patent Publication: ${item.patentDetails.publicationNumber} &bull; Assignee: ${item.patentDetails.assignee}
            </p>
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #431407; line-height: 1.5;">
              <strong>Mechanism:</strong> ${item.patentDetails.mechanismExplanation}
            </p>
            <p style="margin: 0; font-size: 12px; color: #c2410c; font-style: italic; background-color: #ffedd5; padding: 6px 8px; border-radius: 3px;">
              ⚠️ <em>A patent shows what a company has sought to protect, not necessarily what is currently used in Google Search.</em>
            </p>
          </div>
        `
          : '';

        const actionColor =
          item.recommendedAction === 'Take action now'
            ? '#be123c'
            : item.recommendedAction === 'Test'
            ? '#c2410c'
            : '#047857';

        return `
        <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #065f46; background-color: #ecfdf5; padding: 3px 8px; border-radius: 4px;">
              ${item.sourceName}
            </span>
            <span style="font-size: 12px; font-weight: 700; color: ${actionColor}; background-color: #fafaf9; border: 1px solid #e7e5e4; padding: 2px 8px; border-radius: 4px;">
              Priority Score: ${item.relevanceScore}/100 &bull; ${item.recommendedAction}
            </span>
          </div>

          <h3 style="margin: 6px 0 10px 0; font-size: 17px; line-height: 1.35; color: #064e3b;">
            <a href="${item.originalSourceUrl}" target="_blank" style="color: #064e3b; text-decoration: none; font-weight: 700;">
              ${item.title}
            </a>
          </h3>

          ${item.isUpdatedSincePrevious ? '<p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #ea580c;">🔄 Updated since previous coverage</p>' : ''}

          <div style="font-size: 14px; line-height: 1.6; color: #292524; margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0;"><strong>What happened:</strong> ${item.whatHappened}</p>
            <p style="margin: 0 0 8px 0;"><strong>Why it matters:</strong> ${item.whyItMatters}</p>
            <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Confirmed:</strong> ${item.whatIsConfirmed}</p>
            <p style="margin: 0 0 8px 0; color: #b45309;"><strong>Uncertain / Inferences:</strong> ${item.whatRemainsUncertain}</p>
            <p style="margin: 0 0 8px 0; color: #0f766e; background-color: #f0fdfa; padding: 8px 10px; border-radius: 4px;">
              <strong>Strategic SEO Implication:</strong> ${item.practicalSeoImplication}
            </p>
          </div>

          ${patentBlock}

          <div style="margin-top: 10px; font-size: 12px; color: #78716c; border-top: 1px dashed #e7e5e4; padding-top: 8px;">
            <a href="${item.originalSourceUrl}" target="_blank" style="color: #ea580c; text-decoration: underline; font-weight: 600;">
              Read Original Primary Source &rarr;
            </a>
          </div>
        </div>
      `;
      })
      .join('');
  };

  const executiveSummaryList = briefing.executiveSummary
    .map(
      (bullet) => `
      <li style="margin-bottom: 8px; font-size: 15px; line-height: 1.5; color: #1c1917;">
        ${bullet}
      </li>
    `
    )
    .join('');

  const practicalImplicationsList = briefing.practicalImplications
    .map(
      (imp) => `
      <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #1e293b;">
        ${imp}
      </li>
    `
    )
    .join('');

  const sourcesList = briefing.sources
    .map(
      (s) => `
      <li style="margin-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: #44403c;">${s.name}:</span>
        <a href="${s.url}" target="_blank" style="color: #ea580c; text-decoration: underline; margin-left: 4px;">
          ${s.title}
        </a>
      </li>
    `
    )
    .join('');

  const researchNotesList = briefing.researchNotes
    .map(
      (note) => `
      <li style="margin-bottom: 4px; font-size: 12px; color: #78716c; line-height: 1.4;">
        ${note}
      </li>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${briefing.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 28px; color: #ffffff; border-bottom: 3px solid #6366f1;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #818cf8; margin-bottom: 6px;">
                      Senior SEO Intelligence
                    </div>
                    <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.2;">
                      SEO Morning Brief
                    </h1>
                    <div style="font-size: 13px; color: #94a3b8; font-weight: 500;">
                      ${formattedDate}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <div style="background-color: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 10px 14px; border-radius: 8px; font-size: 12px; color: #cbd5e1; line-height: 1.4;">
                      <strong>Research window:</strong> ${new Date(briefing.researchWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &rarr; ${new Date(briefing.researchWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; 
                      <strong>Sources checked:</strong> ${briefing.sourcesCheckedCount} &bull; 
                      <strong>Reviewed:</strong> ${briefing.itemsDiscoveredCount} items &bull; 
                      <strong>Selected:</strong> ${briefing.itemsSelectedCount} highlights
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 28px 24px;">

              <!-- 1. Executive Summary -->
              <div style="margin-bottom: 28px; background-color: #f5f5f4; border-radius: 8px; padding: 18px 20px; border-left: 4px solid #065f46;">
                <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #064e3b;">
                  Executive Summary
                </h2>
                <ul style="margin: 0; padding-left: 20px;">
                  ${executiveSummaryList}
                </ul>
              </div>

              <!-- 2. High-Priority Developments -->
              ${
                briefing.highPriorityHighlights && briefing.highPriorityHighlights.length > 0
                  ? `
                <div style="margin-bottom: 28px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 6px; margin-bottom: 14px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #9a3412;">
                      🔥 High-Priority Developments
                    </h2>
                  </div>
                  ${renderItemList(briefing.highPriorityHighlights)}
                </div>
              `
                  : ''
              }

              <!-- 3. Official Google Updates -->
              <div style="margin-bottom: 28px;">
                <div style="border-bottom: 2px solid #065f46; padding-bottom: 6px; margin-bottom: 14px;">
                  <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #064e3b;">
                    🏛️ Official Google Updates &amp; Documentation
                  </h2>
                </div>
                ${
                  briefing.googleOfficialUpdates && briefing.googleOfficialUpdates.length > 0
                    ? renderItemList(briefing.googleOfficialUpdates)
                    : '<p style="font-size: 14px; color: #57534e; font-style: italic; background-color: #fafaf9; padding: 12px; border-radius: 6px;">No significant official Google updates were identified in this research window.</p>'
                }
              </div>

              <!-- 4. Industry Analysis -->
              ${
                briefing.industryAnalysis && briefing.industryAnalysis.length > 0
                  ? `
                <div style="margin-bottom: 28px;">
                  <div style="border-bottom: 2px solid #065f46; padding-bottom: 6px; margin-bottom: 14px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #064e3b;">
                      📰 Industry Analysis &amp; Technical Reporting
                    </h2>
                  </div>
                  ${renderItemList(briefing.industryAnalysis)}
                </div>
              `
                  : ''
              }

              <!-- 5. Expert Perspectives -->
              ${
                briefing.expertPerspectives && briefing.expertPerspectives.length > 0
                  ? `
                <div style="margin-bottom: 28px;">
                  <div style="border-bottom: 2px solid #065f46; padding-bottom: 6px; margin-bottom: 14px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #064e3b;">
                      💡 Expert Perspectives
                    </h2>
                  </div>
                  ${renderItemList(briefing.expertPerspectives)}
                </div>
              `
                  : ''
              }

              <!-- 6. Patent Watch -->
              ${
                briefing.patentWatch && briefing.patentWatch.length > 0
                  ? `
                <div style="margin-bottom: 28px;">
                  <div style="border-bottom: 2px solid #ea580c; padding-bottom: 6px; margin-bottom: 14px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #9a3412;">
                      🔬 Search Patent Watch
                    </h2>
                  </div>
                  ${renderItemList(briefing.patentWatch)}
                </div>
              `
                  : ''
              }

              <!-- 7. What This Means For Our SEO Work -->
              <div style="margin-bottom: 28px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px 20px;">
                <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
                  What This Means For Our SEO Work
                </h2>
                <ul style="margin: 0; padding-left: 20px;">
                  ${practicalImplicationsList}
                </ul>
              </div>

              <!-- 8. Recommended Actions Matrix -->
              <div style="margin-bottom: 28px;">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #064e3b; border-bottom: 2px solid #065f46; padding-bottom: 6px;">
                  🎯 Recommended Actions
                </h2>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td width="33%" style="vertical-align: top; padding: 10px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px 0 0 6px;">
                      <div style="font-weight: 800; color: #9f1239; margin-bottom: 6px; text-transform: uppercase; font-size: 11px;">⚡ Today</div>
                      <ul style="margin: 0; padding-left: 14px; color: #881337; line-height: 1.4;">
                        ${briefing.recommendedActions.today.map((a) => `<li style="margin-bottom: 4px;">${a}</li>`).join('') || '<li>None required today</li>'}
                      </ul>
                    </td>
                    <td width="33%" style="vertical-align: top; padding: 10px; background-color: #fff7ed; border: 1px solid #fed7aa;">
                      <div style="font-weight: 800; color: #9a3412; margin-bottom: 6px; text-transform: uppercase; font-size: 11px;">📅 This Week</div>
                      <ul style="margin: 0; padding-left: 14px; color: #7c2d12; line-height: 1.4;">
                        ${briefing.recommendedActions.thisWeek.map((a) => `<li style="margin-bottom: 4px;">${a}</li>`).join('') || '<li>Standard roadmap execution</li>'}
                      </ul>
                    </td>
                    <td width="33%" style="vertical-align: top; padding: 10px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0 6px 6px 0;">
                      <div style="font-weight: 800; color: #166534; margin-bottom: 6px; text-transform: uppercase; font-size: 11px;">👁️ Monitor</div>
                      <ul style="margin: 0; padding-left: 14px; color: #14532d; line-height: 1.4;">
                        ${briefing.recommendedActions.monitor.map((a) => `<li style="margin-bottom: 4px;">${a}</li>`).join('') || '<li>Track standard SERP stability</li>'}
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- 9. Sources -->
              <div style="margin-bottom: 24px; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 14px 18px;">
                <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #57534e;">
                  Direct Primary Sources
                </h3>
                <ul style="margin: 0; padding-left: 18px;">
                  ${sourcesList}
                </ul>
              </div>

              <!-- 10. Research Notes & Quality Assurance -->
              <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; font-size: 12px; color: #78716c;">
                <p style="margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; font-size: 11px;">
                  Methodology &amp; Verification Notes:
                </p>
                <ul style="margin: 0; padding-left: 16px;">
                  ${researchNotesList}
                </ul>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f4; border-top: 1px solid #e7e5e4; padding: 18px 24px; text-align: center; font-size: 12px; color: #78716c;">
              <p style="margin: 0 0 6px 0;">
                Generated by <strong>SEO Morning Brief</strong> &bull; Senior-Level Search Intelligence Engine
              </p>
              <p style="margin: 0; font-size: 11px; color: #a8a29e;">
                This briefing was delivered automatically per scheduled settings. To configure sources or update frequency, visit your admin dashboard.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateBriefingPlainText(briefing: Briefing): string {
  const formattedDate = new Date(briefing.researchCompletedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const lines: string[] = [
    `==================================================`,
    `SEO MORNING BRIEF — ${formattedDate}`,
    `==================================================`,
    `Research Window: ${briefing.researchWindowStart} -> ${briefing.researchWindowEnd}`,
    `Sources Checked: ${briefing.sourcesCheckedCount} | Items Reviewed: ${briefing.itemsDiscoveredCount} | Selected: ${briefing.itemsSelectedCount}`,
    ``,
    `--------------------------------------------------`,
    `EXECUTIVE SUMMARY`,
    `--------------------------------------------------`,
    ...briefing.executiveSummary.map((b) => `• ${b}`),
    ``,
    `--------------------------------------------------`,
    `HIGH-PRIORITY & OFFICIAL DEVELOPMENTS`,
    `--------------------------------------------------`
  ];

  const allHighlights = [
    ...briefing.highPriorityHighlights,
    ...briefing.googleOfficialUpdates,
    ...briefing.industryAnalysis,
    ...briefing.expertPerspectives,
    ...briefing.patentWatch
  ];

  for (const item of allHighlights) {
    lines.push(`[${item.sourceName.toUpperCase()}] ${item.title}`);
    lines.push(`Score: ${item.relevanceScore}/100 | Action: ${item.recommendedAction}`);
    lines.push(`What happened: ${item.whatHappened}`);
    lines.push(`Why it matters: ${item.whyItMatters}`);
    lines.push(`Confirmed: ${item.whatIsConfirmed}`);
    lines.push(`Uncertainties: ${item.whatRemainsUncertain}`);
    lines.push(`Implication: ${item.practicalSeoImplication}`);
    if (item.patentDetails) {
      lines.push(`Patent: ${item.patentDetails.publicationNumber} (${item.patentDetails.assignee})`);
      lines.push(`Mechanism: ${item.patentDetails.mechanismExplanation}`);
      lines.push(`NOTE: A patent shows what a company has sought to protect, not necessarily what is currently used in Google Search.`);
    }
    lines.push(`Source URL: ${item.originalSourceUrl}`);
    lines.push(``);
  }

  lines.push(`--------------------------------------------------`);
  lines.push(`WHAT THIS MEANS FOR OUR SEO WORK`);
  lines.push(`--------------------------------------------------`);
  briefing.practicalImplications.forEach((imp) => lines.push(`• ${imp}`));
  lines.push(``);

  lines.push(`--------------------------------------------------`);
  lines.push(`RECOMMENDED ACTIONS`);
  lines.push(`--------------------------------------------------`);
  lines.push(`TODAY:`);
  briefing.recommendedActions.today.forEach((a) => lines.push(`  - ${a}`));
  lines.push(`THIS WEEK:`);
  briefing.recommendedActions.thisWeek.forEach((a) => lines.push(`  - ${a}`));
  lines.push(`MONITOR:`);
  briefing.recommendedActions.monitor.forEach((a) => lines.push(`  - ${a}`));
  lines.push(``);

  lines.push(`--------------------------------------------------`);
  lines.push(`SOURCES`);
  lines.push(`--------------------------------------------------`);
  briefing.sources.forEach((s) => lines.push(`• ${s.name}: ${s.title} (${s.url})`));
  lines.push(``);

  lines.push(`--------------------------------------------------`);
  lines.push(`RESEARCH NOTES`);
  lines.push(`--------------------------------------------------`);
  briefing.researchNotes.forEach((n) => lines.push(`• ${n}`));
  lines.push(``);

  return lines.join('\n');
}

export async function sendBriefingEmail(
  briefing: Briefing,
  recipientEmail?: string,
  fromEmail?: string
): Promise<{ success: boolean; deliveryId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = recipientEmail || process.env.EMAIL_TO || 'ameneh.saeednia@gmail.com';
  const from = fromEmail || process.env.EMAIL_FROM || 'SEO Morning Brief <briefing@updates.yourdomain.com>';

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('re_...')) {
    console.warn('RESEND_API_KEY is not configured or is a placeholder. Simulating email dispatch.');
    return {
      success: true,
      deliveryId: `sim-resend-${Date.now()}`
    };
  }

  try {
    const resend = new Resend(apiKey);
    const html = briefing.html || generateBriefingHtml(briefing);
    const text = briefing.plainText || generateBriefingPlainText(briefing);

    const result = await resend.emails.send({
      from,
      to,
      subject: briefing.subject,
      html,
      text
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Resend failed to deliver email.'
      };
    }

    return {
      success: true,
      deliveryId: result.data?.id || `resend-${Date.now()}`
    };
  } catch (err: any) {
    console.error('Exception sending email via Resend:', err);
    return {
      success: false,
      error: err.message || 'Unknown network or authorization error when calling Resend.'
    };
  }
}
