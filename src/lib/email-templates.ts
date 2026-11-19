/**
 * High-conversion, responsive HTML email templates for SearchProof.
 * Styled with clean typography, table-based layouts for maximum email client compatibility (Outlook, Gmail, Apple Mail).
 */

interface ReportEmailProps {
  agencyName: string;
  agencyLogo?: string | null;
  primaryColor?: string;
  clientName: string;
  period: string;
  note?: string;
  shareUrl: string;
}

export function renderReportEmailHtml({
  agencyName,
  agencyLogo,
  primaryColor = "#0F766E",
  clientName,
  period,
  note,
  shareUrl,
}: ReportEmailProps): string {
  const brandColor = primaryColor || "#0F766E";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${clientName} — Monthly SEO Performance Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Header Banner -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    ${
                      agencyLogo
                        ? `<img src="${agencyLogo}" alt="${agencyName}" height="32" style="height: 32px; max-width: 160px; object-fit: contain; display: block;" />`
                        : `<div style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">${agencyName}</div>`
                    }
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 9999px;">
                      Executive Report
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
                Monthly SEO report
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b;">
                Prepared for <strong>${clientName}</strong> · Period: <strong>${period}</strong>
              </p>

              ${
                note
                  ? `<div style="margin: 0 0 28px 0; padding: 16px 18px; background-color: #f8fafc; border-left: 4px solid ${brandColor}; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                      ${note.replace(/\n/g, "<br/>")}
                    </div>`
                  : ""
              }

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                This month's work log, search metrics, and next actions are ready to read.
              </p>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: ${brandColor};">
                    <a href="${shareUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: -0.01em;">
                      View report &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Attachment Note -->
              <div style="padding: 14px 16px; background-color: #f1f5f9; border-radius: 8px; font-size: 13px; color: #475569; display: flex; align-items: center;">
                <span><strong>PDF attached.</strong> The same report is attached to this email.</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              <p style="margin: 0;">
                Sent by <strong>${agencyName}</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface ResetEmailProps {
  resetUrl: string;
  userEmail: string;
}

export function renderPasswordResetEmailHtml({ resetUrl, userEmail }: ResetEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset your SearchProof password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px;">
                Search<span style="color: #0d9488;">Proof</span>
              </div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                Password Reset Request
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                We received a request to reset the password for <strong>${userEmail}</strong>. Click the button below to choose a new password. This link will expire in 1 hour.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #0f766e;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0 0;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
