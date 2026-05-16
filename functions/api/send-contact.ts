// functions/api/send-contact.ts
// Handles contact form submissions
// Sends notification to Info@wisetech.ca and confirmation to the visitor

// --- Spam detection helpers ---
const CYRILLIC = /[Ѐ-ӿ]/;
const URL_PATTERN = /https?:\/\/[^\s]+|\.onion\b|\.ru\b|\.at\b[^a-z]/gi;
const SPAM_KEYWORDS = [
  'blacksprut', 'blsp', 'bs2best', 'bs2web', 'marketplace',
  'марихуан', 'наркот', 'кокаин', 'героин', 'грибов',
  'casino', 'viagra', 'cialis', 'crypto', 'bitcoin investment',
  'xrumer', 'seo promotion', 'backlinks',
];

function isSpam(fields: string[]): boolean {
  const combined = fields.join(' ').toLowerCase();
  // Cyrillic text in any field
  if (CYRILLIC.test(combined)) return true;
  // More than one URL in message
  const urls = combined.match(URL_PATTERN) || [];
  if (urls.length > 1) return true;
  // Known spam keywords
  if (SPAM_KEYWORDS.some(kw => combined.includes(kw))) return true;
  // Phone number that's suspiciously long (bots often submit 11+ digit numbers with no formatting)
  return false;
}

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

  let name = '', company = '', email = '', phone = '', service = '', message = '', honeypot = '', turnstileToken = '';

  try {
    const contentType = context.request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const body = await context.request.json() as Record<string, string>;
      name = body.name || '';
      company = body.company || '';
      email = body.email || '';
      phone = body.phone || '';
      service = body.service || '';
      message = body.message || '';
      honeypot = body.website || body._gotcha || '';
      turnstileToken = body['cf-turnstile-response'] || '';
    } else {
      const formData = await context.request.formData();
      name = formData.get('name') as string || '';
      company = formData.get('company') as string || '';
      email = formData.get('email') as string || '';
      phone = formData.get('phone') as string || '';
      service = formData.get('service') as string || '';
      message = formData.get('message') as string || '';
      honeypot = (formData.get('website') as string) || (formData.get('_gotcha') as string) || '';
      turnstileToken = formData.get('cf-turnstile-response') as string || '';
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
      status: 400, headers: corsHeaders,
    });
  }

  // Honeypot check — bots fill hidden fields
  if (honeypot) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  }

  if (!name || !email || !email.includes('@') || !message) {
    return new Response(JSON.stringify({ success: false, error: 'Name, email, and message are required' }), {
      status: 400, headers: corsHeaders,
    });
  }

  // Spam content check — silently drop, return 200 so bots don't retry
  if (isSpam([name, company, email, message])) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
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
      // If Turnstile verification itself errors, allow the submission through
      // (better to receive a spam occasionally than block real users)
    }
  }

  // Notification email to owner (Info@wisetech.ca)
  const ownerEmail = {
    from: 'WiseTech Website <support@wisetech.ca>',
    to: ['Info@wisetech.ca'],
    reply_to: email,
    subject: `📩 New Contact Form: ${name}${company ? ` — ${company}` : ''} (${service || 'General inquiry'})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
        <div style="background: #0f172a; padding: 20px 28px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #22d3ee; margin: 0; font-size: 18px;">New Contact Form Submission</h2>
        </div>
        <div style="background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 120px;">Name</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px; color: #0f172a;">${name}</td>
            </tr>
            ${company ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Company</td><td style="padding: 10px 0; font-weight: 600; font-size: 14px; color: #0f172a;">${company}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email</td>
              <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #22d3ee;">${email}</a></td>
            </tr>
            ${phone ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Phone</td><td style="padding: 10px 0; font-size: 14px; color: #0f172a;">${phone}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Service</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0f172a;">${service || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0f172a; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <a href="mailto:${email}?subject=Re: Your WiseTech Inquiry" style="display: inline-block; background: #22d3ee; color: #0f172a; font-weight: 700; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px;">
              Reply to ${name}
            </a>
          </div>
        </div>
      </div>
    `,
  };

  // Confirmation email to visitor
  const visitorEmail = {
    from: 'WiseTech Support <support@wisetech.ca>',
    to: [email],
    subject: `We received your message, ${name.split(' ')[0]} — WiseTech`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px 40px; text-align: center;">
          <h1 style="color: #22d3ee; font-size: 24px; font-weight: 800; margin: 0 0 4px;">WiseTech</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Advanced IT Solutions · Mississauga, ON</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px;">
            Thanks for reaching out, ${name.split(' ')[0]}!
          </h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 16px;">
            We received your message and will get back to you within <strong>one business hour</strong> during business hours (Monday–Friday, 8am–6pm EST).
          </p>

          <!-- Summary box -->
          <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 0 28px;">
            <p style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Your message summary</p>
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px;"><strong style="color: #0f172a;">Service:</strong> ${service || 'General inquiry'}</p>
            <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;"><strong style="color: #0f172a;">Message:</strong> ${message.length > 120 ? message.substring(0, 120) + '...' : message}</p>
          </div>

          <p style="color: #475569; line-height: 1.6; margin: 0 0 28px;">
            In the meantime, you can use our free IT assessment checklist to evaluate your business's current IT posture — it takes about 5 minutes and shows exactly where your gaps are.
          </p>

          <div style="text-align: center; margin: 0 0 32px;">
            <a href="https://wisetech.ca/free-assessment" style="display: inline-block; background: #22d3ee; color: #0f172a; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
              Try the Free IT Assessment →
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 4px;">Need to reach us directly?</p>
            <p style="color: #475569; font-size: 14px; margin: 0;">
              📞 <a href="tel:8884459473" style="color: #22d3ee;">888-445-9473</a> &nbsp;·&nbsp;
              ✉️ <a href="mailto:Info@wisetech.ca" style="color: #22d3ee;">Info@wisetech.ca</a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0f172a; padding: 24px 40px; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            © 2026 WiseTech Inc. · 750-2 Robert Speck Parkway, Mississauga, ON L4Z 1H8<br/>
            <a href="https://wisetech.ca" style="color: #22d3ee; text-decoration: none;">wisetech.ca</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    const [ownerRes, visitorRes] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerEmail),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorEmail),
      }),
    ]);

    if (ownerRes.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Message sent successfully.' }), {
        status: 200, headers: corsHeaders,
      });
    } else {
      const err = await ownerRes.json() as { message?: string };
      return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to send message' }), {
        status: 500, headers: corsHeaders,
      });
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500, headers: corsHeaders,
    });
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
