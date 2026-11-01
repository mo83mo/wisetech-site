// src/pages/data/chat-knowledge.txt.ts
// Builds the AI chat assistant's knowledge base from the site's own content at build time,
// so the bot stays in sync whenever services, industries, pricing or FAQs change.
// Served as /data/chat-knowledge.txt and read by functions/api/chat.ts. Public site content only.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';
import { plans, addons, pricingFaqs, enterprisePlan, enterpriseMinUsers } from '../../data/pricing';
import { generalFaqs } from '../../data/faqs';
import { processSteps, commitments } from '../../data/process';

const BASE = 'https://wisetech.ca';

const faqLines = (faqs: { question: string; answer: string }[]) =>
  faqs.map(f => `- Q: ${f.question}\n  A: ${f.answer}`).join('\n');

export const GET: APIRoute = async () => {
  const services = (await getCollection('services')).sort((a, b) => a.data.title.localeCompare(b.data.title));
  const industries = (await getCollection('industries')).sort((a, b) => a.data.title.localeCompare(b.data.title));

  const sections: string[] = [];

  sections.push(`## Company
- WiseTech Inc. is a managed IT services provider based in Mississauga, Ontario, Canada.
- Who we serve: small and medium-sized businesses across the Greater Toronto Area. WiseTech never turns a business away because of its size. Plans start at five users; larger organisations (including teams with 100+ users) get a tailored proposal after a free assessment.
- Clients get a direct line to the person responsible for their systems — no call centre or ticket queue — backed by enterprise-grade monitoring and security tools that run 24/7. Every environment is documented and kept in the client's name, so they are never locked in or dependent on any one person.
- Phone: ${site.phone} · Email: ${site.email} · Office: ${site.address}
- Hours: ${site.hours}. 24/7 monitoring stays active outside business hours; 24/7 support is on the Professional and Advanced plans.
- On-site service area: ${site.serviceAreas.join(', ')} and the rest of the GTA. Remote helpdesk support for clients anywhere in Ontario.`);

  sections.push(`## Useful pages
- Book a free IT assessment / contact form: ${BASE}/contact/
- Free IT & security health check (20 plain-English questions, about 4 minutes, instant score and top priorities, optional emailed report): ${BASE}/free-assessment/
- Pricing and cost calculator: ${BASE}/pricing/
- All services: ${BASE}/services/ · Industries: ${BASE}/industries/
- About WiseTech: ${BASE}/about/ · Blog: ${BASE}/blog/
- Existing client support (phone, email, hours): ${BASE}/support/ · System status: https://status.wisetech.ca`);

  sections.push(`## Plans and pricing (CAD, per user per month)
Published per-user prices apply to teams of ${plans[0].minUsers}–${enterpriseMinUsers - 1} users. Organisations with ${enterpriseMinUsers}+ users are on the Enterprise plan (custom pricing, described below) — never multiply list prices by their user count.
${plans.map(p => `### ${p.name} — $${p.monthlyPrice}/user/month
- Annual billing: $${p.annualMonthlyEquiv}/user/month equivalent ($${p.annualYearlyTotal}/user/year, saves $${p.annualSavings}/user/year)
- Minimum ${p.minUsers} users · Best for: ${p.bestFor}
- Includes: ${p.features.join('; ')}${p.notIncluded?.length ? `\n- Not included: ${p.notIncluded.join('; ')}` : ''}`).join('\n')}
### ${enterprisePlan.name} — custom pricing (${enterprisePlan.audience})
- No list price. ${enterprisePlan.summary}
- Includes: ${enterprisePlan.features.join('; ')}
- Next step: book a free assessment at ${BASE}/contact/?service=managed-it&plan=enterprise or leave contact details in chat.

### Add-ons
${addons.map(a => `- ${a.name}: ${a.price}`).join('\n')}

### Pricing questions
${faqLines(pricingFaqs)}`);

  sections.push(`## How working with WiseTech works
${processSteps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`).join('\n')}
Commitments: ${commitments.join('; ')}.`);

  sections.push(`## General questions
${faqLines(generalFaqs)}`);

  sections.push(`## Services
${services.map(s => `### ${s.data.title} (${BASE}/services/${s.slug}/)
${s.data.metaDescription}
${s.data.hero.subheadline}
What's included:
${s.data.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}
FAQs:
${faqLines(s.data.faqs)}`).join('\n\n')}`);

  sections.push(`## Industries served
${industries.map(i => `### ${i.data.title} (${BASE}/industries/${i.slug}/)
${i.data.metaDescription}
${i.data.hero.subheadline}
How we help:
${i.data.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}
FAQs:
${faqLines(i.data.faqs)}`).join('\n\n')}`);

  return new Response(`# WiseTech public knowledge base\n\n${sections.join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
