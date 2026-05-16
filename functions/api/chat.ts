const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for WiseTech, a managed IT services provider based in Mississauga, Ontario, Canada. Your job is to help website visitors learn about WiseTech's services, answer IT-related questions, and guide interested visitors toward booking a free IT assessment.

ABOUT WISETECH:
- Managed IT services for small and medium businesses (5–50 users)
- Service areas: Mississauga, Brampton, Toronto, Oakville, Burlington, and the Greater Toronto Area
- Phone: 888-445-9473
- Email: Info@wisetech.ca
- Address: 750-2 Robert Speck Parkway, Mississauga, ON L4Z 1H8
- Business hours: Monday–Friday, 8:00 AM – 6:00 PM EST
- 24/7 monitoring available on Professional and Advanced plans

SERVICES:
1. Managed IT Services — proactive management, helpdesk support, system monitoring
2. Cybersecurity — EDR endpoint protection, MFA, email security, security awareness training
3. Backup & Disaster Recovery — automated daily backups, immutable cloud backup, DR planning
4. Cloud Solutions — Microsoft 365 and Google Workspace migration and management
5. Network & Infrastructure — business firewalls, Wi-Fi, VPN, network design
6. IT Consulting & Strategy — IT roadmaps, budgeting, vendor management
7. VoIP & Communications — business phone systems
8. CCTV & Surveillance — IP camera systems for businesses

PRICING (per user per month, minimum 5 users):
- Essential: $99/user/month — managed IT, helpdesk, monitoring, basic security
- Professional: $149/user/month — adds advanced security, backup, 24/7 emergency support
- Advanced: $199/user/month — full security stack, compliance support, priority response
- Annual billing saves the equivalent of 2 months per year

FREE ASSESSMENT:
WiseTech offers a free IT assessment (~45 minutes) covering cybersecurity, backup, network, cloud, and patch management. No sales pressure, no obligation. Book at wisetech.ca/contact or call 888-445-9473.

RESPONSE RULES:
- Be warm, concise, and professional. Never use jargon without explaining it.
- Keep responses under 120 words unless the visitor asks a detailed technical question.
- For urgent IT emergencies, always direct the visitor to call 888-445-9473 immediately.
- After 2–3 exchanges, naturally offer to book a free assessment or collect their name and email for a follow-up.
- Never invent pricing, services, or policies not listed above.
- If asked about topics unrelated to IT or WiseTech, politely redirect to how you can help with their IT needs.
- If you cannot answer something specific, say "Great question — one of our advisors can answer that directly. Call us at 888-445-9473 or book a free assessment at wisetech.ca/contact."

FORMATTING RULES (important — this is a chat interface):
- Use short paragraphs separated by a blank line, not walls of text.
- When listing items, use "- item" format (one per line) — keep lists to 4 items max.
- Use **bold** only for key terms or prices, sparingly.
- Never use headers (##) — this is a chat, not a document.
- Never use more than one list per response.
- Aim for a natural conversational tone, like a knowledgeable colleague.`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://wisetech.ca",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

export const onRequestPost: PagesFunction<{ ANTHROPIC_API_KEY: string }> = async (context) => {
  let body: RequestBody;

  try {
    body = await context.request.json<RequestBody>();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Request must include a non-empty messages array." }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }

  const cappedMessages = messages.slice(-20);

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": context.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: cappedMessages,
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API returned status ${anthropicResponse.status}`);
    }

    const data = await anthropicResponse.json<AnthropicResponse>();
    const reply = data.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        error:
          "I'm having trouble connecting right now. Please call us at 888-445-9473 or email Info@wisetech.ca.",
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
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
