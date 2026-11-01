# WiseTech — Claude Project Context

> This file is auto-read by any Claude/Cowork session connected to this repo.
> It gives full context so no re-explaining is needed.
> Last updated: 2026-05-17

---

## The Business

**WiseTech Inc.** is a managed IT services provider based in Mississauga, Ontario, Canada. Owner: **Mo Waez**. The website at wisetech.ca is the primary lead generation tool targeting small and medium-sized businesses across the GTA. WiseTech never turns a business away because of its size: published plans cover 5–49 users, and 50+ users get the custom-priced Enterprise plan.

Mo also works full-time as a Project Manager at **Trinity Contents Management Inc.** (insurance/contents claims). Keep WiseTech and Trinity work separate unless Mo explicitly links them.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | Astro 4.16.19 | Static site, `npm run build` to build |
| CSS | Tailwind CSS 3 | Navy `#0f172a`, cyan `#22d3ee` |
| Hosting | Cloudflare Pages | Auto-deploys on push to `main` |
| Functions | Cloudflare Pages Functions | `/functions/api/*.ts` — TypeScript |
| Email | Resend API | From: `support@wisetech.ca` |
| AI chat | Anthropic Claude Haiku | `/functions/api/chat.ts` |
| Spam protection | Cloudflare Turnstile | Contact form + assessment form |
| Analytics | Google Tag Manager (GTM-NL2PD7TD) | Includes GA4 + LinkedIn Insight |

---

## Deployment Workflow

1. Make changes locally in `C:\Users\muham\wisetech-site\`
2. Run `npm run build` to verify — must show `[build] Complete!` with no errors
3. `git add` specific files → `git commit` → `git push origin main`
4. Cloudflare Pages auto-deploys within ~2 minutes
5. **Never push without a successful build first**

---

## Environment Variables (Cloudflare Pages — never in code)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend transactional email |
| `ANTHROPIC_API_KEY` | Claude AI chat widget |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile bot protection |

Access these only via `context.env.VARIABLE_NAME` in Pages Functions. Never hardcode.

---

## Key Files

```
src/
  pages/
    index.astro           — Homepage
    contact.astro         — Contact form (→ /api/send-contact)
    free-assessment.astro — IT & security health check, instant results + optional emailed report (→ /api/send-assessment; questions in src/data/health-check.ts)
    pricing.astro         — Pricing page with calculator
    blog/[slug].astro     — Blog post template
    services/[slug].astro — Service page template
    industries/[slug].astro — Industry page template
  components/
    ChatWidget.astro      — AI chat widget (all pages via BaseLayout)
    Nav.astro             — Navigation (logo: h-[67px])
    Footer.astro          — Footer (logo: h-[83px])
  content/
    blog/                 — Markdown blog posts
    services/             — Markdown service pages
    industries/           — Markdown industry pages
  layouts/
    BaseLayout.astro      — Includes ChatWidget, GTM, schema markup
    PageLayout.astro      — Wraps BaseLayout with nav/footer

functions/api/
  chat.ts                 — AI chat (calls Anthropic API)
  chat-lead.ts            — Lead notification + transcript emails
  send-contact.ts         — Contact form → Resend (spam filtered + Turnstile)
  send-assessment.ts      — Assessment email capture → Resend (Turnstile)

public/
  _redirects              — Old Wix URL redirects (DO NOT add trailing slash rules)
  images/                 — logo-white.png, logo-transparent.png, favicon files
```

---

## Content Collections Schema

Blog frontmatter (required):
```yaml
title: "string"
description: "150-160 char SEO meta description"
pubDate: YYYY-MM-DD        # Use TODAY's date — never backdate
category: "Cybersecurity"  # Must be: Cybersecurity | Cloud | IT Tips | Industry News
author: "WiseTech Team"
readTime: 8                # Estimated minutes
heroImage: "https://images.unsplash.com/photo-XXXXXXXXXX?w=1200&h=630&fit=crop&auto=format"
```

---

## Approved Unsplash Hero Images (verified working)

Use these for blog posts — never invent random photo IDs.

**IMPORTANT — no duplicate hero images:** Before picking one, run:
`grep -h 'heroImage:' src/content/blog/*.md`
Do NOT use any photo ID that already appears in the results.

- Cybersecurity/lock: `photo-1614064641938-3bbee52942c7`
- Hacker/threat: `photo-1563986768494-4dee2763ff3f`
- Laptop/security: `photo-1555949963-ff9fe0c870eb`
- Network/servers: `photo-1558494949-ef010cbdcc31`
- Cloud/technology (earth): `photo-1451187580459-43490279c0fa`
- Business/office: `photo-1497366216548-37526070297c`
- Password/login: `photo-1526374965328-7f61d4dc18c5`
- Mobile/phone: `photo-1512941937669-90a1b58e7e9c`
- Backup/data: `photo-1544197150-b99a580bb7a8`
- Team/meeting: `photo-1552664730-d307ca884978`
- Code/glasses reflection: `photo-1504639725590-34d0984388bd`
- Business consulting/laptops: `photo-1454165804606-c3d57bc86b40`
- IT support/pointing at screen: `photo-1516321318423-f06f85e504b3`
- Business team celebration: `photo-1600880292203-757bb62b4baf`
- Analytics dashboard (dark): `photo-1551288049-bebda4e38f71`
- Digital/data rain abstract: `photo-1568952433726-3896e3881c65`

---

## Standing Rules

1. **Review before deploying** — Show Mo the plan and wait for approval before making changes to live site
2. **Canadian English** — All content: recognised, organised, prioritised, licence, colour, neighbour
3. **Build must pass** — Run `npm run build` before every commit. Fix errors before pushing
4. **No trailing slash rules in `_redirects`** — Causes ERR_TOO_MANY_REDIRECTS on Cloudflare Pages
5. **Secrets stay in env vars** — Never commit API keys, tokens, or passwords to the repo
6. **Blog post dates** — Always use today's actual date. Never backdate
7. **Reminders** — For any follow-up deadline, create a RemoteTrigger one-time scheduled routine that emails Info@wisetech.ca through the **Gmail connector** (`mcp_connections`: connector_uuid `9b8b1ee3-613e-48d8-98c5-5886955d0c11`, name `Gmail`, url `https://gmailmcp.googleapis.com/mcp/v1`; include `mcp__Gmail` in `allowed_tools`). Do NOT POST to `/api/send-contact` — it requires a Turnstile token, so scripted requests are rejected. Remember `run_once_at` is UTC: Toronto is UTC-4 in summer (EDT) and UTC-5 from November to March (EST)

---

## Services (8 total)

Managed IT · Cybersecurity · Backup & Disaster Recovery · Cloud Solutions (M365/Google Workspace) · Network & Infrastructure · IT Consulting & Strategy · VoIP & Communications · CCTV & Surveillance

**Pricing:** $99 / $149 / $199 per user/month for 5–49 users · Annual = 2 months free · **Enterprise** (50+ users or multiple locations): custom, volume-based pricing, "Contact us" — no list-price totals. Plan data lives in `src/data/pricing.ts` (also feeds the AI chat's knowledge base).

---

## Industries Served (pages at /industries/)

Accounting & Finance · Dental & Healthcare · Education · Hospitality · Law Firms · Manufacturing · Real Estate · Retail & eCommerce

---

## Blog Automation

Two Claude Sonnet 5.5 routines run automatically — no manual action needed (cron is 13:00 UTC: 9am EDT in summer, 8am EST in winter):
- **Tuesday** → trig_01UtpkL6tgDVKd1jNGsaBQKu
- **Friday** → trig_01JhMMtJcrj3xorM8phS44FU

Each agent reads existing posts to avoid duplicate topics, researches sourced stats, writes a full SEO post, runs `npm ci` + `npm run build`, commits as "Claude", and pushes to `main` through the **Claude GitHub App** (installed on mo83mo/wisetech-site only). No tokens in the prompts. If posts stop appearing, check the app's repo access first, then the routine's run log (RemoteTrigger `list_runs` / `get_run_log`).

---

## Second Brain (Read at Session Start)

Mo has a second brain in two places — read both at the start of every session:

1. **Obsidian** — `00 START HERE.md` (most current state + pending tasks)
2. **Notion** — Claude Context page (full business brief + standing instructions)

Update both at the end of every session.

---

## Contact

- **Email:** Info@wisetech.ca
- **Support sending:** support@wisetech.ca
- **Phone:** 888-445-9473
- **Address:** 750-2 Robert Speck Parkway, Mississauga, ON L4Z 1H8
- **Hours:** Mon–Fri 8am–6pm EST
- **GitHub:** mo83mo/wisetech-site
- **LinkedIn:** linkedin.com/company/wisetech-inc
