// functions/api/chat-lead.ts
// Emails a chat lead to WiseTech and a transcript copy to the visitor.
// Hardened because it sends email to a visitor-supplied address: requests must come from
// wisetech.ca, pass Cloudflare Turnstile, and every field is validated and HTML-escaped.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://wisetech.ca",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const ALLOWED_ORIGINS = ["https://wisetech.ca", "https://www.wisetech.ca"];

interface LeadBody {
  name: string;
  email: string;
  phone: string;
  company: string;
  summary: string;
  transcript: string;
}

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

// Field limits: [max length, pattern]
const FIELD_RULES: Record<keyof LeadBody, [number, RegExp]> = {
  name: [100, /^[^<>{}\[\]\n\r]{2,}$/],
  company: [150, /^[^<>{}\[\]\n\r]{1,}$/],
  email: [254, /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i],
  phone: [40, /^[0-9+().\-\s]{7,}$/],
  summary: [500, /^[^<>]{1,}$/],
  transcript: [20000, /^[\s\S]{1,}$/],
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateLead(raw: Record<string, unknown>): LeadBody | null {
  const lead = {} as LeadBody;
  for (const [field, [max, pattern]] of Object.entries(FIELD_RULES) as [keyof LeadBody, [number, RegExp]][]) {
    const value = raw[field];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > max || !pattern.test(trimmed)) return null;
    lead[field] = trimmed;
  }
  return lead;
}

async function verifyTurnstile(secret: string, token: unknown, ip: string): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function todayFormatted(): string {
  return new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Toronto",
  });
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function cleanTranscript(raw: string): string {
  // Strip [LEAD:{...}] markers that the AI embeds — they should never appear in emails
  return raw.replace(/\[LEAD:\{[^}]*\}\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function buildLeadEmail(lead: LeadBody): string {
  const cleanedTranscript = cleanTranscript(lead.transcript);
  const transcriptHtml = escapeHtml(cleanedTranscript);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#0a2540;padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">&#x1F916; New AI Chat Lead</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:8px;color:#374151;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">Contact Details</td>
              </tr>
              <tr>
                <td style="padding-bottom:4px;color:#111827;font-size:16px;"><strong>Name:</strong> ${escapeHtml(lead.name)}</td>
              </tr>
              <tr>
                <td style="padding-bottom:4px;color:#111827;font-size:16px;"><strong>Company:</strong> ${escapeHtml(lead.company)}</td>
              </tr>
              <tr>
                <td style="padding-bottom:4px;color:#111827;font-size:16px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(lead.email)}" style="color:#0a2540;">${escapeHtml(lead.email)}</a></td>
              </tr>
              <tr>
                <td style="padding-bottom:24px;color:#111827;font-size:16px;"><strong>Phone:</strong> ${escapeHtml(lead.phone)}</td>
              </tr>
              <tr>
                <td style="padding-bottom:8px;color:#374151;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">Problem Summary</td>
              </tr>
              <tr>
                <td style="padding-bottom:24px;color:#111827;font-size:16px;line-height:1.6;">${escapeHtml(lead.summary)}</td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <a href="mailto:${escapeHtml(lead.email)}" style="display:inline-block;background:#0a2540;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:16px;font-weight:bold;">Reply to Lead</a>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:8px;color:#374151;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">Full Conversation Transcript</td>
              </tr>
              <tr>
                <td>
                  <pre style="background:#f3f4f6;border-radius:6px;padding:16px;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:#111827;margin:0;">${transcriptHtml}</pre>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildTranscriptEmail(lead: LeadBody, date: string): string {
  const transcriptHtml = escapeHtml(cleanTranscript(lead.transcript));

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#0a2540;padding:28px 32px;text-align:center;">
            <img src="https://wisetech.ca/images/logo-white.png" alt="WiseTech" width="160" style="display:block;margin:0 auto;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#111827;font-size:16px;line-height:1.6;">Hi ${escapeHtml(firstName(lead.name))},</p>
            <p style="margin:0 0 24px;color:#111827;font-size:16px;line-height:1.6;">Here's a copy of your conversation with WiseTech AI today.</p>
            <pre style="background:#f3f4f6;border-radius:6px;padding:16px;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:#111827;margin:0 0 32px;">${transcriptHtml}</pre>
            <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">One of our advisors will be in touch within one business hour. In the meantime, you can give our team an even fuller picture before the call by completing our free IT assessment — it only takes about 5 minutes.</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:24px 0;">
                  <a href="https://wisetech.ca/free-assessment" style="display:inline-block;background:#0a2540;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:16px;font-weight:bold;">Complete Free IT Assessment &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0a2540;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 4px;color:#d1d5db;font-size:13px;">&#128222; 888-445-9473 &nbsp;|&nbsp; &#9993; Info@wisetech.ca</p>
            <p style="margin:0 0 4px;color:#d1d5db;font-size:13px;">750-2 Robert Speck Parkway, Mississauga, ON</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;">Mon&ndash;Fri 8am&ndash;6pm EST</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(
  apiKey: string,
  to: string,
  from: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<void> {
  const payload: Record<string, unknown> = { from, to, subject, html };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}

function reply(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { RESEND_API_KEY, TURNSTILE_SECRET_KEY } = context.env;
  const { request } = context;

  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin") ?? "")) {
    return reply({ success: false, error: "Forbidden." }, 403);
  }
  if (!RESEND_API_KEY) {
    return reply({ success: false, error: "Email service not configured." }, 500);
  }

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return reply({ success: false, error: "Invalid request." }, 400);
  }

  // Only a real browser on wisetech.ca can get a Turnstile token, so bots can't use this to send email
  if (TURNSTILE_SECRET_KEY) {
    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    if (!(await verifyTurnstile(TURNSTILE_SECRET_KEY, raw?.turnstileToken, ip))) {
      return reply({ success: false, error: "Security check failed." }, 403);
    }
  }

  const lead = validateLead(raw ?? {});
  if (!lead) {
    return reply({ success: false, error: "Invalid lead details." }, 400);
  }
  const { name, email, company } = lead;

  const date = todayFormatted();

  try {
    // Email 1 — Lead notification to support@wisetech.ca
    await sendEmail(
      RESEND_API_KEY,
      "support@wisetech.ca",
      "WiseTech AI <support@wisetech.ca>",
      `🤖 New AI Chat Lead — ${name} from ${company}`,
      buildLeadEmail(lead),
      email
    );

    // Email 2 — Transcript to visitor
    await sendEmail(
      RESEND_API_KEY,
      email,
      "WiseTech Support <support@wisetech.ca>",
      `Your WiseTech Chat Transcript — ${date}`,
      buildTranscriptEmail(lead, date)
    );

    return reply({ success: true }, 200);
  } catch (err) {
    // Log the provider error for debugging, but don't expose it to the browser
    console.error("chat-lead: email send failed", err instanceof Error ? err.message : err);
    return reply({ success: false, error: "Could not send email." }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
    },
  });
};
