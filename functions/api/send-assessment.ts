// functions/api/send-assessment.ts
// Sends visitor a detailed personalised IT assessment report
// Sends Info@wisetech.ca a qualified lead notification with full breakdown

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistSection {
  title: string;
  icon: string;
  checked: string[];
  unchecked: string[];
}

// ─── Risk priority map (all 30 checklist items) ───────────────────────────────
// Lower number = higher priority / greater risk if missing

const RISK_MAP: Record<string, { priority: number; risk: string }> = {
  'Is multi-factor authentication (MFA) enabled on all business email accounts?': {
    priority: 1,
    risk: 'Account takeover is the #1 cause of data breaches and ransomware entry',
  },
  'Do all workstations have business-grade endpoint protection (EDR), not just consumer antivirus?': {
    priority: 2,
    risk: 'Ransomware and malware can run undetected for days without EDR',
  },
  'Is email security filtering configured to block phishing and malicious attachments?': {
    priority: 3,
    risk: 'Over 90% of cyberattacks start with a phishing email reaching an inbox',
  },
  'Are backups stored off-site or in the cloud (not just on a local drive)?': {
    priority: 4,
    risk: 'Ransomware encrypts local backup drives alongside your live data',
  },
  'Are all critical business files backed up automatically every day?': {
    priority: 5,
    risk: 'Without daily backups you risk losing days or weeks of irreplaceable work',
  },
  'Is remote access to your network secured with a VPN?': {
    priority: 6,
    risk: 'Unsecured remote access is the second most common ransomware entry point',
  },
  'Do you have a business-grade firewall protecting your network?': {
    priority: 7,
    risk: 'Consumer routers lack deep-packet inspection needed to block modern threats',
  },
  'Are your backups immutable (protected from ransomware encryption)?': {
    priority: 8,
    risk: 'Modern ransomware specifically targets and encrypts backup repositories',
  },
  'Do you have a written incident response plan for a cyberattack?': {
    priority: 9,
    risk: 'Without a plan, response time triples and recovery costs increase significantly',
  },
  'Have your staff completed security awareness training in the last 12 months?': {
    priority: 10,
    risk: 'Untrained staff are the most common reason phishing attacks succeed',
  },
  'Are Windows/macOS updates applied to all workstations within 30 days of release?': {
    priority: 11,
    risk: 'Unpatched systems contain known vulnerabilities actively exploited by attackers',
  },
  'Are servers on a regular patching schedule?': {
    priority: 12,
    risk: 'Unpatched servers are a top entry point for ransomware and data breaches',
  },
  'Is your Wi-Fi network segmented (guest Wi-Fi separate from business systems)?': {
    priority: 13,
    risk: 'A compromised guest device can reach your business systems on a flat network',
  },
  'Are DMARC, DKIM, and SPF records configured on your email domain?': {
    priority: 14,
    risk: 'Without these records attackers can spoof your domain to commit fraud',
  },
  'Is Microsoft 365 or Google Workspace admin access properly secured with MFA and limited to IT staff?': {
    priority: 15,
    risk: 'A compromised admin account gives full control of your entire cloud environment',
  },
  'Are you using a business-tier Microsoft 365 or Google Workspace plan (not personal/consumer accounts)?': {
    priority: 16,
    risk: 'Consumer plans lack the security controls and compliance features required for business use',
  },
  'Do you have a process for revoking cloud access when employees leave?': {
    priority: 17,
    risk: 'Former employees with active credentials represent an ongoing insider access risk',
  },
  'Do you have cyber insurance coverage?': {
    priority: 18,
    risk: 'Without coverage, your business absorbs the full cost of a breach — often $100,000+',
  },
  'Is all third-party software (browsers, Office, Adobe, etc.) kept up to date?': {
    priority: 19,
    risk: 'Outdated third-party software is a common exploit kit target',
  },
  'Are firmware updates applied to network devices and servers?': {
    priority: 20,
    risk: 'Outdated firmware on routers and switches can harbour exploitable vulnerabilities',
  },
  'Have you tested a full restore from backup in the last 6 months?': {
    priority: 21,
    risk: 'Untested backups frequently fail at the worst possible time — during a real incident',
  },
  'Do you have a documented Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?': {
    priority: 22,
    risk: 'Without defined RTO/RPO, recovery from an incident lacks direction and drags on',
  },
  'Do you have a documented IT security policy?': {
    priority: 23,
    risk: 'A security policy is required for most cyber insurance policies and compliance frameworks',
  },
  'Do you have a privacy policy that covers how client data is collected and stored?': {
    priority: 24,
    risk: 'Required under PIPEDA for any Canadian business that handles personal information',
  },
  'Are all network devices (routers, switches, access points) under support?': {
    priority: 25,
    risk: 'End-of-life network devices no longer receive security patches',
  },
  'Do you have a documented network diagram showing all devices?': {
    priority: 26,
    risk: 'Without visibility into your network, unknown devices and risks go undetected',
  },
  'Are all software licences tracked and up to date?': {
    priority: 27,
    risk: 'Unlicensed or expired software may stop receiving critical security updates',
  },
  'Is your line-of-business software hosted in the cloud or on a supported server?': {
    priority: 28,
    risk: 'Unsupported servers running business software represent a significant ongoing risk',
  },
  'If your business handles health information, do you have PHIPA compliance controls in place?': {
    priority: 29,
    risk: 'PHIPA violations carry significant fines and reputational damage for Ontario healthcare businesses',
  },
  'Is there a process for securely disposing of old computers and hard drives?': {
    priority: 30,
    risk: 'Improperly disposed drives can expose sensitive client and business data',
  },
};

// ─── Score theme helper ────────────────────────────────────────────────────────

function getScoreTheme(pct: number) {
  if (pct >= 1)   return { color: '#22d3ee', bg: '#f0fdfe', border: '#22d3ee', label: 'Excellent',     message: '🎉 Excellent IT posture — you have most controls in place. Book a call to verify the details.' };
  if (pct >= 0.7) return { color: '#22c55e', bg: '#f0fdf4', border: '#22c55e', label: 'Good',          message: '✅ Good foundation — a few gaps remain. An assessment will give you a prioritised action plan.' };
  if (pct >= 0.4) return { color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b', label: 'Fair',          message: '🔶 Some gaps found. A WiseTech assessment will help you prioritise what to fix first.' };
  return           { color: '#ef4444', bg: '#fef2f2', border: '#ef4444', label: 'Needs Attention', message: '⚠️ Significant gaps identified — we strongly recommend a professional assessment.' };
}

// ─── Email HTML generators ─────────────────────────────────────────────────────

function buildSectionBreakdown(sections: ChecklistSection[]): string {
  if (!sections.length) return '';
  return sections.map(({ title, icon, checked, unchecked }) => {
    const total = checked.length + unchecked.length;
    const checkedRows = checked.map(item => `
      <div style="padding:9px 18px;border-bottom:1px solid #f1f5f9;background:#f0fdf4;">
        <span style="color:#22c55e;font-weight:700;font-size:13px;">✓</span>
        <span style="color:#374151;font-size:13px;margin-left:8px;">${item}</span>
      </div>`).join('');
    const uncheckedRows = unchecked.map(item => `
      <div style="padding:9px 18px;border-bottom:1px solid #f1f5f9;">
        <span style="color:#ef4444;font-weight:700;font-size:13px;">✗</span>
        <span style="color:#9ca3af;font-size:13px;margin-left:8px;">${item}</span>
      </div>`).join('');
    return `
      <div style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:14px;overflow:hidden;">
        <div style="background:#f8fafc;padding:11px 18px;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:16px;">${icon}</span>
          <strong style="color:#0f172a;font-size:14px;margin-left:7px;">${title}</strong>
          <span style="float:right;color:#64748b;font-size:12px;background:white;border:1px solid #e5e7eb;padding:2px 9px;border-radius:99px;">${checked.length} / ${total}</span>
        </div>
        ${checkedRows}${uncheckedRows}
      </div>`;
  }).join('');
}

function buildTopGaps(sections: ChecklistSection[]): string {
  const all: Array<{ item: string; section: string; priority: number; risk: string }> = [];
  sections.forEach(s => {
    s.unchecked.forEach(item => {
      const info = RISK_MAP[item] ?? { priority: 99, risk: 'Addresses an important IT security or operational gap.' };
      all.push({ item, section: s.title, priority: info.priority, risk: info.risk });
    });
  });
  const top5 = all.sort((a, b) => a.priority - b.priority).slice(0, 5);
  if (!top5.length) return '<p style="color:#22c55e;font-size:14px;">No critical gaps found — great work!</p>';
  return top5.map(({ item, section, risk }, i) => `
    <div style="display:flex;align-items:flex-start;gap:0;margin-bottom:12px;background:#fff8f8;border:1px solid #fee2e2;border-radius:8px;padding:14px 16px;">
      <div style="background:#ef4444;color:white;font-weight:800;font-size:12px;min-width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;margin-right:12px;flex-shrink:0;">${i + 1}</div>
      <div>
        <p style="color:#0f172a;font-size:14px;font-weight:600;margin:0 0 3px;">${item}</p>
        <p style="color:#64748b;font-size:12px;margin:0 0 3px;font-style:italic;">${section}</p>
        <p style="color:#ef4444;font-size:12px;margin:0;"><strong>Risk:</strong> ${risk}</p>
      </div>
    </div>`).join('');
}

function buildCheckedSummary(sections: ChecklistSection[]): string {
  const all = sections.flatMap(s => s.checked.map(item => ({ item, section: s.title })));
  if (!all.length) return '';
  return all.map(({ item }) => `
    <div style="padding:7px 0;border-bottom:1px solid #f1f5f9;">
      <span style="color:#22c55e;font-weight:700;">✓</span>
      <span style="color:#374151;font-size:13px;margin-left:8px;">${item}</span>
    </div>`).join('');
}

// Compact section table for owner notification email
function buildOwnerSections(sections: ChecklistSection[]): string {
  if (!sections.length) return '';
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b;border-bottom:2px solid #e5e7eb;">Category</th>
          <th style="text-align:center;padding:8px 12px;font-size:12px;color:#64748b;border-bottom:2px solid #e5e7eb;">Score</th>
          <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b;border-bottom:2px solid #e5e7eb;">Key Gaps</th>
        </tr>
      </thead>
      <tbody>
        ${sections.map(s => {
          const total = s.checked.length + s.unchecked.length;
          const pct = total ? Math.round((s.checked.length / total) * 100) : 0;
          const barColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
          const topGaps = s.unchecked.slice(0, 2).map(g => `<li style="color:#64748b;font-size:12px;">${g}</li>`).join('');
          return `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#0f172a;">${s.icon} ${s.title}</td>
            <td style="padding:10px 12px;text-align:center;">
              <span style="background:${barColor};color:white;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;">${s.checked.length}/${total}</span>
            </td>
            <td style="padding:10px 12px;"><ul style="margin:0;padding-left:16px;">${topGaps || '<li style="color:#22c55e;font-size:12px;">All clear</li>'}</ul></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export const onRequestPost: PagesFunction<{ RESEND_API_KEY: string; TURNSTILE_SECRET_KEY: string }> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://wisetech.ca',
    'Content-Type': 'application/json',
  };

  const apiKey = context.env.RESEND_API_KEY;
  const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
      status: 500, headers: corsHeaders,
    });
  }

  let email = '', score = '', turnstileToken = '', checklistRaw = '';

  try {
    const contentType = context.request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const body = await context.request.json() as Record<string, string>;
      email          = body.email || '';
      score          = body.assessment_score || '';
      turnstileToken = body['cf-turnstile-response'] || '';
      checklistRaw   = body.checklist_data || '';
    } else {
      const fd = await context.request.formData();
      email          = fd.get('email') as string || '';
      score          = fd.get('assessment_score') as string || '';
      turnstileToken = fd.get('cf-turnstile-response') as string || '';
      checklistRaw   = fd.get('checklist_data') as string || '';
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
      status: 400, headers: corsHeaders,
    });
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ success: false, error: 'Valid email is required' }), {
      status: 400, headers: corsHeaders,
    });
  }

  // Cloudflare Turnstile verification
  if (turnstileSecret) {
    if (!turnstileToken) {
      return new Response(JSON.stringify({ success: false, error: 'Please complete the security check.' }), {
        status: 400, headers: corsHeaders,
      });
    }
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: context.request.headers.get('CF-Connecting-IP') || '',
        }),
      });
      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return new Response(JSON.stringify({ success: false, error: 'Security check failed. Please refresh and try again.' }), {
          status: 400, headers: corsHeaders,
        });
      }
    } catch {
      // Allow through if Turnstile API itself is unreachable
    }
  }

  // Parse checklist data
  let sections: ChecklistSection[] = [];
  try {
    if (checklistRaw) sections = JSON.parse(checklistRaw) as ChecklistSection[];
  } catch { /* use empty sections — email still sends without breakdown */ }

  // Compute score metrics
  const scoreDisplay = score || 'Not recorded';
  const parts = score.split(' / ');
  const scoreNum = parseInt(parts[0]) || 0;
  const totalItems = parseInt(parts[1]) || 30;
  const pct = totalItems > 0 ? scoreNum / totalItems : 0;
  const barWidth = Math.max(2, Math.round(pct * 100));
  const theme = getScoreTheme(pct);

  const hasSections = sections.length > 0;
  const totalChecked = sections.reduce((acc, s) => acc + s.checked.length, 0);
  const totalUnchecked = sections.reduce((acc, s) => acc + s.unchecked.length, 0);

  // ── Visitor email ───────────────────────────────────────────────────────────
  const visitorHtml = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:0;">

      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:28px 40px;text-align:center;">
        <img src="https://wisetech.ca/images/logo-white.png" width="160" height="auto" alt="WiseTech" style="display:inline-block;max-width:160px;" />
        <p style="color:#94a3b8;font-size:12px;margin:6px 0 0;letter-spacing:0.5px;">Advanced IT Solutions · Mississauga, ON</p>
      </div>

      <!-- BODY -->
      <div style="background:#ffffff;padding:36px 40px;">

        <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 8px;">Your IT Assessment Results</h2>
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 28px;">
          Thank you for completing the WiseTech Free IT Assessment Checklist.
          Below is your personalised results report — including what you have in place,
          where the gaps are, and what to prioritise first.
        </p>

        <!-- SCORE CARD -->
        <div style="background:${theme.bg};border:2px solid ${theme.border};border-radius:12px;padding:24px 28px;text-align:center;margin:0 0 32px;">
          <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Your Overall Score</p>
          <p style="color:#0f172a;font-size:46px;font-weight:800;margin:0 0 4px;line-height:1;">${scoreDisplay}</p>
          <p style="color:#64748b;font-size:12px;margin:0 0 14px;">items currently in place</p>
          <!-- Progress bar -->
          <div style="background:#e2e8f0;border-radius:6px;height:10px;margin:0 0 14px;overflow:hidden;">
            <div style="background:${theme.color};width:${barWidth}%;height:10px;border-radius:6px;"></div>
          </div>
          <p style="color:${theme.color};font-size:14px;font-weight:600;margin:0;">${theme.message}</p>
        </div>

        ${hasSections ? `
        <!-- SECTION BREAKDOWN -->
        <h3 style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">
          📊 Your Results by Category
        </h3>
        ${buildSectionBreakdown(sections)}

        <!-- TOP 5 PRIORITY GAPS -->
        ${totalUnchecked > 0 ? `
        <h3 style="color:#0f172a;font-size:16px;font-weight:700;margin:28px 0 14px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">
          🚨 Your Top ${Math.min(5, totalUnchecked)} Priority Gaps
        </h3>
        <p style="color:#475569;font-size:13px;margin:0 0 14px;line-height:1.6;">
          These are the highest-risk items you haven't yet addressed, ranked by the potential impact on your business:
        </p>
        ${buildTopGaps(sections)}
        ` : ''}

        <!-- WHAT YOU'RE DOING RIGHT -->
        ${totalChecked > 0 ? `
        <h3 style="color:#0f172a;font-size:16px;font-weight:700;margin:28px 0 14px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">
          ✅ What You Have In Place (${totalChecked} items)
        </h3>
        <div style="margin-bottom:8px;">
          ${buildCheckedSummary(sections)}
        </div>
        ` : ''}
        ` : `
        <!-- Fallback if no checklist data -->
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Every unchecked item on the assessment represents a gap in your IT security, backup, or compliance posture —
          whether that is the risk of a ransomware attack, data loss, or a compliance violation.
        </p>
        `}

        <!-- NEXT STEPS -->
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:24px 28px;margin:32px 0;text-align:center;">
          <h3 style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 8px;">Ready to close these gaps?</h3>
          <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 20px;">
            A WiseTech professional assessment goes deeper than this checklist — we review your actual systems,
            identify your specific vulnerabilities, and give you a prioritised action plan. It's <strong>free</strong> and takes about 45 minutes.
          </p>
          <a href="https://wisetech.ca/contact" style="display:inline-block;background:#22d3ee;color:#0f172a;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;">
            Book Your Free Professional Assessment →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin:12px 0 0;">No obligation · Free · ~45 minutes</p>
        </div>

        <p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0;">
          Questions? Reply to this email or call us at
          <a href="tel:8884459473" style="color:#22d3ee;">888-445-9473</a>.
          We serve Mississauga, Toronto, Brampton, Oakville, Burlington, and the GTA.
        </p>
      </div>

      <!-- FOOTER -->
      <div style="background:#0f172a;padding:28px 40px;text-align:center;">
        <img src="https://wisetech.ca/images/logo-white.png" width="120" height="auto" alt="WiseTech" style="display:inline-block;max-width:120px;margin-bottom:14px;" />
        <p style="color:#94a3b8;font-size:13px;margin:0 0 6px;">
          📞 <a href="tel:8884459473" style="color:#22d3ee;text-decoration:none;">888-445-9473</a>
          &nbsp;·&nbsp;
          ✉️ <a href="mailto:Info@wisetech.ca" style="color:#22d3ee;text-decoration:none;">Info@wisetech.ca</a>
        </p>
        <p style="color:#64748b;font-size:12px;margin:0 0 6px;">
          📍 750-2 Robert Speck Parkway, Mississauga, ON L4Z 1H8
        </p>
        <p style="color:#64748b;font-size:12px;margin:0 0 14px;">
          Mon–Fri 8:00 AM – 6:00 PM EST
        </p>
        <p style="color:#334155;font-size:11px;margin:0;">
          © 2026 WiseTech Inc. &nbsp;·&nbsp;
          <a href="https://wisetech.ca" style="color:#22d3ee;text-decoration:none;">wisetech.ca</a>
          &nbsp;·&nbsp;
          <a href="https://wisetech.ca/privacy" style="color:#475569;text-decoration:none;">Privacy Policy</a>
        </p>
      </div>

    </div>`;

  // ── Owner notification email ────────────────────────────────────────────────
  const ownerHtml = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:0;background:#f1f5f9;">

      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:20px 28px;">
        <img src="https://wisetech.ca/images/logo-white.png" width="120" height="auto" alt="WiseTech" style="display:inline-block;" />
      </div>

      <!-- BODY -->
      <div style="background:#ffffff;padding:28px;">
        <h2 style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 4px;">🎯 New Assessment Lead</h2>
        <p style="color:#64748b;font-size:13px;margin:0 0 20px;">Submitted via the Free IT Assessment checklist on wisetech.ca</p>

        <!-- Lead details -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 0;color:#64748b;font-size:13px;width:100px;">Email</td>
            <td style="padding:10px 0;font-weight:600;font-size:14px;">
              <a href="mailto:${email}" style="color:#22d3ee;">${email}</a>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 0;color:#64748b;font-size:13px;">Score</td>
            <td style="padding:10px 0;font-weight:700;font-size:20px;color:${theme.color};">
              ${scoreDisplay} <span style="font-size:13px;color:#64748b;font-weight:400;">(${theme.label})</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b;font-size:13px;">Gaps found</td>
            <td style="padding:10px 0;font-weight:600;font-size:14px;color:#ef4444;">${totalUnchecked} unchecked items</td>
          </tr>
        </table>

        <a href="mailto:${email}?subject=Your WiseTech IT Assessment Follow-Up" style="display:inline-block;background:#22d3ee;color:#0f172a;font-weight:700;font-size:14px;text-decoration:none;padding:10px 22px;border-radius:6px;margin-bottom:28px;">
          Reply to Lead →
        </a>

        ${hasSections ? `
        <!-- Section breakdown table -->
        <h3 style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 4px;">Results Breakdown</h3>
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Quick overview of what they have vs. what's missing:</p>
        ${buildOwnerSections(sections)}

        <!-- Top 5 gaps -->
        ${totalUnchecked > 0 ? `
        <h3 style="color:#0f172a;font-size:15px;font-weight:700;margin:24px 0 12px;">Top ${Math.min(5, totalUnchecked)} Priority Gaps</h3>
        ${buildTopGaps(sections)}
        ` : ''}
        ` : ''}
      </div>

      <!-- FOOTER -->
      <div style="background:#0f172a;padding:16px 28px;text-align:center;">
        <p style="color:#475569;font-size:11px;margin:0;">WiseTech Inc. · 750-2 Robert Speck Parkway, Mississauga, ON</p>
      </div>
    </div>`;

  // ── Send both emails ────────────────────────────────────────────────────────
  try {
    const [visitorRes] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'WiseTech Support <support@wisetech.ca>',
          to: [email],
          subject: `Your WiseTech IT Assessment Report — ${scoreDisplay} (${theme.label})`,
          html: visitorHtml,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'WiseTech Website <support@wisetech.ca>',
          to: ['Info@wisetech.ca'],
          subject: `🎯 New Assessment Lead — ${scoreDisplay} (${theme.label}) — ${email}`,
          html: ownerHtml,
        }),
      }),
    ]);

    if (visitorRes.ok) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }
    const err = await visitorRes.json() as { message?: string };
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to send email' }), {
      status: 500, headers: corsHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Server error sending email' }), {
      status: 500, headers: corsHeaders,
    });
  }
};

// Handle OPTIONS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://wisetech.ca',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
