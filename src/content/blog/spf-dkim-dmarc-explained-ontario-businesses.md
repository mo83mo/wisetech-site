---
title: "SPF, DKIM and DMARC Explained in Plain English for Ontario Businesses"
metaTitle: "SPF, DKIM and DMARC Explained Simply | WiseTech"
description: "SPF, DKIM and DMARC explained in plain English: how these three email records stop spoofing, protect your brand and keep your mail out of spam in Ontario."
pubDate: 2026-11-03
category: "Cybersecurity"
author: "WiseTech Team"
readTime: 6
heroImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=630&fit=crop&auto=format"
---

A client calls your office to ask why you emailed them a new bank account number for your next invoice. You didn't. Someone sent a message that looked exactly like it came from your domain, and your client nearly paid it. This is email spoofing, and the three settings called **SPF, DKIM and DMARC** are the main defence against it.

The names sound technical, but the ideas are simple. This guide explains what each one does, why they matter for your Ontario business, and how to check yours in about ten minutes.

## Why email spoofing is so easy

Email was designed in an era when everyone on the network was trusted. Nothing in the original system checks that the "From" address is genuine. Anyone can type your company name and address into a message, just as anyone can write your return address on an envelope.

That is why spoofed messages are a favourite tool in [business email compromise](/blog/business-email-compromise-bec-ontario-guide/) attacks. The criminal doesn't need to break into your systems. They only need your clients, suppliers or staff to believe the message is yours.

The three records below fix this by letting receiving mail servers verify a message before delivering it.

## SPF: the approved sender list

**SPF (Sender Policy Framework)** is a public list of the services allowed to send email for your domain. Think of it as a guest list at the door. When a message arrives claiming to be from your company, the receiving server checks whether the sending system is on your list.

Your list usually includes Microsoft 365 or Google Workspace, plus any other tool that sends as you: your invoicing software, newsletter platform, website contact form or CRM.

Two common mistakes cause trouble:

- **Forgetting a sender.** A forgotten tool means its legitimate email fails the check and lands in spam.
- **Having more than one SPF record.** A domain must have exactly one. Two records cause the check to fail entirely.

## DKIM: the tamper-proof seal

**DKIM (DomainKeys Identified Mail)** adds a digital signature to every message you send. It works like a wax seal on a letter: it proves the message really came from your domain and that nobody altered it on the way.

Your email provider generates the signature, and you publish a matching "public key" in your domain settings so receivers can verify it. In [Microsoft 365](/blog/microsoft-365-security-hardening-guide/) and [Google Workspace](/blog/google-workspace-security-hardening-ontario-smbs/), DKIM is often available but not switched on by default, so it is worth confirming.

![Network servers in a data centre that deliver business email](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&auto=format)

## DMARC: the rule that ties it together

SPF and DKIM each run a check, but neither tells the receiving server what to do when a message fails. **DMARC (Domain-based Message Authentication, Reporting and Conformance)** supplies that instruction. It also sends you reports showing who is sending email using your domain name, which is how you discover forgotten tools and impersonation attempts.

A DMARC policy has three levels:

- **p=none:** monitor only. Failing mail is still delivered, but you receive reports.
- **p=quarantine:** failing mail is sent to the spam folder.
- **p=reject:** failing mail is blocked outright.

Only quarantine and reject actually stop spoofed messages. Many businesses publish p=none, feel finished and never move on, which leaves their domain just as easy to impersonate as before. The Canadian Centre for Cyber Security covers all three protocols in its [email domain protection guidance (ITSP.40.065)](https://cyber.gc.ca/en/guidance/implementation-guidance-email-domain-protection), which explains that DMARC lets receivers apply your chosen policy when a message fails SPF or DKIM checks that align with your domain.

## It's also about deliverability

Authentication isn't only about security. Since February 2024, Google and Yahoo have required senders of large volumes of email to publish at least a basic DMARC policy, and Microsoft began rejecting non-compliant bulk mail in May 2025, according to industry reports on the changes. Those rules target high-volume senders, but the direction is clear: mailbox providers increasingly treat unauthenticated email with suspicion.

For a small or mid-sized business, the practical effect is that quotes, invoices and newsletters from a domain without proper records are more likely to end up in a client's spam folder. Setting these records up protects your reputation and your inbox placement at the same time.

## What to do next

You can make real progress in a week:

1. **Check what you have.** Free tools such as Google's Admin Toolbox or MXToolbox will show whether your domain has SPF, DKIM and DMARC records.
2. **List every system that sends email as you.** Include invoicing, marketing, ticketing and website forms.
3. **Fix SPF and enable DKIM** for each sender on the list.
4. **Publish DMARC at p=none** with a reporting address, and review the reports for two to four weeks.
5. **Move to quarantine, then reject** once legitimate mail is passing consistently.
6. **Protect domains you don't use for email.** Parked or old domains can be spoofed too, and can safely be set to reject everything.

Rushing straight to p=reject is the usual way businesses break their own email, which is why the monitoring step matters. If you handle sensitive client information, such as in [law firms](/industries/law-firms/) or [accounting and finance](/industries/accounting-finance/), a spoofed message can also create privacy obligations under [PIPEDA](/blog/pipeda-compliance-ontario-small-businesses/).

## Get it set up properly

This is a ten-minute check but sometimes a multi-week project, especially if you have many email-sending tools. Our [cybersecurity team](/services/cybersecurity/) and [managed IT services](/services/managed-it/) handle email authentication for GTA businesses, from the first audit through to full enforcement. To see where your business stands today, [take the free IT health check](/free-assessment/) (20 questions, about 4 minutes) or [book a free IT assessment](/contact/) and we'll review your domain with you.

---

## Related Posts

- [Business Email Compromise: How It Works and How to Stop It](/blog/business-email-compromise-bec-ontario-guide/)
- [Microsoft 365 Security Hardening: A Practical Guide for Ontario Small Businesses](/blog/microsoft-365-security-hardening-guide/)
- [Phishing Simulation Training: Why Your Ontario Business Needs It Now](/blog/phishing-simulation-training-guide-ontario-smbs/)
