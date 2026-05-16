// functions/api/send-assessment.ts
// Handles assessment email capture form submissions
// Sends visitor their results + notifies Info@wisetech.ca of the lead

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

  let email = '';
  let score = '';
  let turnstileToken = '';

  try {
    const contentType = context.request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const body = await context.request.json() as { email?: string; assessment_score?: string; 'cf-turnstile-response'?: string };
      email = body.email || '';
      score = body.assessment_score || '';
      turnstileToken = body['cf-turnstile-response'] || '';
    } else {
      const formData = await context.request.formData();
      email = formData.get('email') as string || '';
      score = formData.get('assessment_score') as string || '';
      turnstileToken = formData.get('cf-turnstile-response') as string || '';
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
      // If Turnstile API itself errors, allow through to avoid blocking real users
    }
  }

  const scoreDisplay = score || 'Not provided';

  // Email to the visitor with their results
  const visitorEmail = {
    from: 'WiseTech Support <support@wisetech.ca>',
    to: [email],
    subject: `Your WiseTech IT Assessment Results — ${scoreDisplay}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px 40px; text-align: center;">
          <h1 style="color: #22d3ee; font-size: 24px; font-weight: 800; margin: 0 0 4px;">WiseTech</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Advanced IT Solutions</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px;">Your IT Assessment Results</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Thank you for completing the WiseTech Free IT Assessment Checklist. Here is a summary of your results:
          </p>

          <!-- Score box -->
          <div style="background: #f0f9ff; border: 2px solid #22d3ee; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px;">
            <p style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">Your Score</p>
            <p style="color: #0f172a; font-size: 36px; font-weight: 800; margin: 0 0 4px;">${scoreDisplay}</p>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Items currently in place</p>
          </div>

          <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 12px;">What This Means for Your Business</h3>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 16px;">
            Every unchecked item on the assessment represents a gap in your IT security, backup, or compliance posture.
            These gaps represent real risk — whether that is a ransomware attack, data loss, or a compliance violation.
          </p>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 32px;">
            A WiseTech professional assessment goes deeper than this checklist — we review your actual systems,
            identify your specific vulnerabilities, and give you a prioritised action plan. It is free and takes about 45 minutes.
          </p>

          <!-- CTA -->
          <div style="text-align: center; margin: 0 0 32px;">
            <a href="https://wisetech.ca/contact" style="display: inline-block; background: #22d3ee; color: #0f172a; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
              Book Your Free Professional Assessment
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
            Questions? Reply to this email or call us at <a href="tel:8884459473" style="color: #22d3ee;">888-445-9473</a>.
            We serve Mississauga, Toronto, Brampton, Oakville, and the GTA.
          </p>
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

  // Notification email to owner
  const ownerEmail = {
    from: 'WiseTech Website <support@wisetech.ca>',
    to: ['Info@wisetech.ca'],
    subject: `🎯 New Assessment Lead — Score: ${scoreDisplay}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f172a;">New Assessment Lead</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Score:</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${scoreDisplay}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Source:</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">Free Assessment Checklist</td></tr>
        </table>
        <p style="margin-top: 16px;"><a href="mailto:${email}" style="background: #22d3ee; color: #0f172a; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px;">Reply to Lead</a></p>
      </div>
    `,
  };

  try {
    // Send both emails
    const [visitorRes, ownerRes] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorEmail),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerEmail),
      }),
    ]);

    if (visitorRes.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Assessment results sent to your email.' }), {
        status: 200, headers: corsHeaders,
      });
    } else {
      const err = await visitorRes.json() as { message?: string };
      return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to send email' }), {
        status: 500, headers: corsHeaders,
      });
    }
  } catch (err) {
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
