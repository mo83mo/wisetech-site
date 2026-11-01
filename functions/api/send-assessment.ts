// functions/api/send-assessment.ts
// Emails the visitor their IT & Security Health Check report and sends Info@wisetech.ca a lead summary.
// The browser sends only question IDs and Yes / No / Not sure answers; the score and every sentence
// in the emails come from src/data/health-check.ts, so nothing a visitor types except their name and
// company (validated and escaped) ends up in an email.
import {
  questions, areas, teamSizes, industries, itSupportOptions, scoreAnswers, gradeFor,
  type Answer, type HealthResult,
} from '../../src/data/health-check';

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://wisetech.ca',
  'Content-Type': 'application/json',
};
const ALLOWED_ORIGINS = ['https://wisetech.ca', 'https://www.wisetech.ca'];
const ANSWERS: Answer[] = ['yes', 'no', 'unsure'];

function reply(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Free-text fields: trimmed, length-capped, no markup characters or line breaks
function cleanText(value: unknown, max: number): string | null {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (v.length > max || /[<>{}\[\]\r\n]/.test(v)) return null;
  return v;
}

function pickFrom(value: unknown, allowed: string[]): string {
  return typeof value === 'string' && allowed.includes(value) ? value : '';
}

async function verifyTurnstile(secret: string, token: unknown, ip: string): Promise<boolean> {
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ─── Email building blocks ──────────────────────────────────────────────────────

const toneColour: Record<string, string> = { good: '#10b981', fair: '#06b6d4', risk: '#f59e0b', high: '#ef4444' };
const barColour = (pct: number) => (pct >= 85 ? '#10b981' : pct >= 65 ? '#06b6d4' : pct >= 40 ? '#f59e0b' : '#ef4444');

function areaTable(result: HealthResult): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:0 0 28px;">
      ${result.areaScores.map(({ area, pct, yes, total }) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;width:45%;">${area.icon} ${area.title}</td>
        <td style="padding:8px 12px;">
          <div style="background:#e2e8f0;border-radius:6px;height:8px;overflow:hidden;">
            <div style="background:${barColour(pct)};width:${Math.max(pct, 3)}%;height:8px;"></div>
          </div>
        </td>
        <td style="padding:8px 0;font-size:13px;color:#64748b;text-align:right;white-space:nowrap;">${yes}/${total} · ${pct}%</td>
      </tr>`).join('')}
    </table>`;
}

function priorityList(result: HealthResult, limit: number): string {
  const top = result.gaps.slice(0, limit);
  if (!top.length) return '<p style="color:#10b981;font-size:14px;margin:0 0 24px;">No gaps found — every protection we asked about is in place.</p>';
  return top.map((q, i) => `
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:0 0 10px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f172a;">${i + 1}. ${q.fix}</p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">${q.why}</p>
    </div>`).join('');
}

function questionList(items: string[], colour: string): string {
  return items.map(text => `<li style="font-size:13px;color:${colour};margin:0 0 6px;line-height:1.5;">${text}</li>`).join('');
}

function visitorEmail(name: string, result: HealthResult): string {
  const grade = gradeFor(result.pct);
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;">
    <div style="background:#0f172a;padding:28px 40px;text-align:center;">
      <img src="https://wisetech.ca/images/logo-white.png" width="150" alt="WiseTech" style="display:inline-block;max-width:150px;" />
    </div>
    <div style="background:#ffffff;padding:36px 40px;">
      <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;">Hi ${escapeHtml(name)}, here's your IT health check report</h2>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Thanks for completing the WiseTech IT &amp; Security Health Check. Below is your score, how each area compares,
        and the steps that would make the biggest difference.
      </p>

      <div style="border:2px solid ${toneColour[grade.tone]};border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
        <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Your IT health score</p>
        <p style="color:#0f172a;font-size:46px;font-weight:800;margin:0;line-height:1.1;">${result.pct}%</p>
        <p style="color:${toneColour[grade.tone]};font-size:18px;font-weight:700;margin:4px 0 10px;">${grade.label}</p>
        <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">${grade.message}</p>
      </div>

      <h3 style="color:#0f172a;font-size:16px;margin:0 0 10px;">By area</h3>
      ${areaTable(result)}

      <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;">Your priorities</h3>
      ${priorityList(result, 5)}

      ${result.unsure.length ? `
      <h3 style="color:#0f172a;font-size:16px;margin:24px 0 8px;">Worth checking</h3>
      <p style="color:#475569;font-size:13px;margin:0 0 8px;">You weren't sure about these. If you can't confirm it's in place, it's safest to assume it isn't.</p>
      <ul style="margin:0 0 20px;padding-left:20px;">${questionList(result.unsure.map(q => q.question), '#92400e')}</ul>` : ''}

      ${result.inPlace.length ? `
      <h3 style="color:#0f172a;font-size:16px;margin:24px 0 8px;">Already in place (${result.inPlace.length})</h3>
      <ul style="margin:0 0 20px;padding-left:20px;">${questionList(result.inPlace.map(q => q.question), '#047857')}</ul>` : ''}

      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:24px;margin:28px 0;text-align:center;">
        <h3 style="color:#0f172a;font-size:16px;margin:0 0 8px;">Want an expert to confirm it?</h3>
        <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 18px;">
          A free professional assessment checks your actual systems — not just your answers — and gives you a written,
          prioritised plan. No obligation.
        </p>
        <a href="https://wisetech.ca/contact/?service=cybersecurity&amp;from=health-check&amp;score=${result.pct}" style="display:inline-block;background:#22d3ee;color:#0f172a;font-weight:700;font-size:15px;text-decoration:none;padding:13px 28px;border-radius:8px;">Book a Free Assessment →</a>
      </div>

      <p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0;">
        Questions? Reply to this email or call <a href="tel:8884459473" style="color:#06b6d4;">888-445-9473</a>.
        WiseTech serves Mississauga, Toronto, Brampton, Oakville, Burlington and the GTA.
      </p>
    </div>
    <div style="background:#0f172a;padding:20px 40px;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">WiseTech Inc. · 750-2 Robert Speck Parkway, Mississauga, ON L4Z 1H8 ·
        <a href="https://wisetech.ca/privacy/" style="color:#22d3ee;text-decoration:none;">Privacy Policy</a></p>
    </div>
  </div>`;
}

function ownerEmail(lead: { name: string; email: string; company: string; teamSize: string; industry: string; itSupport: string }, result: HealthResult): string {
  const grade = gradeFor(result.pct);
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:150px;">${label}</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${value || '<span style="color:#94a3b8;font-weight:400;">Not given</span>'}</td></tr>`;
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;background:#ffffff;padding:28px;">
    <h2 style="color:#0f172a;font-size:18px;margin:0 0 4px;">🎯 New health check lead — ${result.pct}% (${grade.label})</h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 18px;">Completed the IT &amp; Security Health Check on wisetech.ca</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      ${row('Name', escapeHtml(lead.name))}
      ${row('Email', `<a href="mailto:${escapeHtml(lead.email)}" style="color:#06b6d4;">${escapeHtml(lead.email)}</a>`)}
      ${row('Company', escapeHtml(lead.company))}
      ${row('Team size', lead.teamSize ? `${escapeHtml(lead.teamSize)} users` : '')}
      ${row('Industry', escapeHtml(lead.industry))}
      ${row('IT handled by', escapeHtml(lead.itSupport))}
    </table>
    <a href="mailto:${escapeHtml(lead.email)}?subject=Your%20WiseTech%20IT%20health%20check" style="display:inline-block;background:#22d3ee;color:#0f172a;font-weight:700;font-size:14px;text-decoration:none;padding:10px 20px;border-radius:6px;margin:0 0 22px;">Reply to Lead →</a>
    <h3 style="color:#0f172a;font-size:15px;margin:0 0 8px;">Scores by area</h3>
    ${areaTable(result)}
    <h3 style="color:#0f172a;font-size:15px;margin:0 0 10px;">Top gaps (${result.gaps.length} total)</h3>
    ${priorityList(result, 5)}
    ${result.unsure.length ? `<h3 style="color:#0f172a;font-size:15px;margin:18px 0 8px;">Not sure (${result.unsure.length}) — good discovery-call topics</h3>
    <ul style="margin:0;padding-left:20px;">${questionList(result.unsure.map(q => q.question), '#92400e')}</ul>` : ''}
  </div>`;
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ─── Handler ────────────────────────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!ALLOWED_ORIGINS.includes(request.headers.get('Origin') ?? '')) {
    return reply({ success: false, error: 'Forbidden.' }, 403);
  }
  if (!env.RESEND_API_KEY) {
    return reply({ success: false, error: 'Email service not configured.' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reply({ success: false, error: 'Invalid request.' }, 400);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const ip = request.headers.get('CF-Connecting-IP') ?? '';
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body['cf-turnstile-response'], ip))) {
      return reply({ success: false, error: 'Security check failed. Please refresh the page and try again.' }, 403);
    }
  }

  const name = cleanText(body.name, 80);
  const company = cleanText(body.company, 120);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!name || company === null || email.length > 254 || !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(email)) {
    return reply({ success: false, error: 'Please check your name and email address.' }, 400);
  }

  // Only known question IDs with Yes / No / Not sure answers; every question must be answered
  const raw = (body.answers ?? {}) as Record<string, unknown>;
  const answers: Record<string, Answer> = {};
  for (const q of questions) {
    const a = raw[q.id];
    if (typeof a === 'string' && (ANSWERS as string[]).includes(a)) answers[q.id] = a as Answer;
  }
  if (Object.keys(answers).length !== questions.length) {
    return reply({ success: false, error: 'Please answer every question first.' }, 400);
  }

  const lead = {
    name,
    email,
    company: company ?? '',
    teamSize: pickFrom(body.teamSize, teamSizes),
    industry: pickFrom(body.industry, industries),
    itSupport: pickFrom(body.itSupport, itSupportOptions),
  };
  const result = scoreAnswers(answers);
  const grade = gradeFor(result.pct);

  try {
    const [visitorRes, ownerRes] = await Promise.all([
      sendEmail(env.RESEND_API_KEY, {
        from: 'WiseTech <support@wisetech.ca>',
        to: [email],
        reply_to: 'Info@wisetech.ca',
        subject: `Your IT health check report — ${result.pct}% (${grade.label})`,
        html: visitorEmail(name, result),
      }),
      sendEmail(env.RESEND_API_KEY, {
        from: 'WiseTech Website <support@wisetech.ca>',
        to: ['Info@wisetech.ca'],
        reply_to: email,
        subject: `🎯 Health check lead — ${result.pct}% (${grade.label})${lead.teamSize ? ` · ${lead.teamSize} users` : ''}`,
        html: ownerEmail(lead, result),
      }),
    ]);
    if (!ownerRes.ok) console.error('send-assessment: owner email failed', ownerRes.status);
    if (!visitorRes.ok) {
      console.error('send-assessment: visitor email failed', visitorRes.status, (await visitorRes.text()).slice(0, 300));
      return reply({ success: false, error: 'Could not send the report.' }, 502);
    }
    return reply({ success: true }, 200);
  } catch (err) {
    console.error('send-assessment: email request failed', err);
    return reply({ success: false, error: 'Could not send the report.' }, 502);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://wisetech.ca',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
