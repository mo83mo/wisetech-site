// functions/api/test-email.ts
// TEMPORARY TEST ENDPOINT — remove after confirming Resend works
// Access at: https://wisetech.ca/api/test-email

export const onRequest: PagesFunction<{ RESEND_API_KEY: string }> = async (context) => {
  const apiKey = context.env.RESEND_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({
      success: false,
      error: 'RESEND_API_KEY environment variable is not set'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WiseTech Support <support@wisetech.ca>',
        to: ['Info@wisetech.ca'],
        subject: '✅ Resend Test — WiseTech Website Email Working',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0f172a;">✅ Resend is working correctly</h2>
            <p style="color: #475569;">This test email confirms that:</p>
            <ul style="color: #475569;">
              <li>The RESEND_API_KEY is valid and correctly configured</li>
              <li>Emails can be sent from <strong>support@wisetech.ca</strong></li>
              <li>The Cloudflare Pages Function environment is working</li>
            </ul>
            <p style="color: #475569; margin-top: 24px; font-size: 14px;">
              This is a test email sent from the WiseTech website test endpoint.<br/>
              The test endpoint will be removed once confirmed working.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json() as { id?: string; message?: string; name?: string };

    if (response.ok) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Test email sent successfully to Info@wisetech.ca',
        resend_id: data.id,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: data.message || 'Resend API returned an error',
        details: data,
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to connect to Resend API',
      details: String(err),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
