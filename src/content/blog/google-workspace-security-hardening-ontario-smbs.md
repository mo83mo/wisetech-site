---
title: "Google Workspace Security Hardening: A Practical Guide for Ontario Small Businesses"
metaTitle: "Google Workspace Security Hardening | WiseTech"
description: "Harden your Google Workspace environment with this step-by-step guide for Ontario small businesses. Protect email, Drive, and admin accounts from cyber threats."
pubDate: 2026-09-22
category: "Cloud"
author: "WiseTech Team"
readTime: 8
heroImage: "https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=1200&h=630&fit=crop&auto=format"
---

Picture this: a small law firm in Mississauga switches to Google Workspace to modernise their operations. Within six months, a staff member's account is compromised through a phishing email — and suddenly the attacker has access to every shared Drive folder, every client email, and the admin console itself. It's not a hypothetical. Cloud account takeover attacks surged by 47% in 2024, with Google and Microsoft platforms among the most targeted. For Ontario small businesses, the stakes are particularly high given PIPEDA's breach notification requirements and the reputational damage a data leak can cause in tight-knit professional communities.

The good news: Google Workspace comes with robust security controls. The frustrating reality is that most of them are not turned on by default. Out-of-the-box settings are designed to get you up and running quickly, not to protect sensitive business data. If you've never taken a deliberate look at your Admin Console security settings, there's almost certainly something left unaddressed.

## Why Default Settings Are Not Enough

Google Workspace's default configuration prioritises usability and collaboration over restriction. That means file sharing is relatively open, two-step verification is optional rather than mandatory, external app connections are permitted without scrutiny, and alert policies are minimal. For a team of five people who trust each other completely, those defaults feel fine — until one account is compromised.

For Ontario businesses handling client data — whether you're an accounting firm, a dental practice, a real estate office, or a manufacturer — the default settings likely do not meet your obligations under PIPEDA or sector-specific regulations. A Google Workspace environment that hasn't been hardened is also an easy target: attackers routinely scan for Workspace accounts with weak authentication, exploiting Google's own legitimate infrastructure to host phishing pages or exfiltrate data.

The sections below walk through the highest-impact changes you can make, starting with the areas that pose the greatest risk if left unaddressed.

## Securing the Super Admin Account

Your Workspace super admin account is the master key to everything: user accounts, billing, all data, and security settings. If an attacker gains super admin access, the damage is effectively unlimited. Yet many small businesses use the owner's personal Gmail-associated account as the super admin and log into it daily for email.

The first thing to fix is separation. Create a dedicated super admin account that exists only for administration — something like `admin@yourdomain.com` — and never use it for day-to-day email. Enrol this account in Google's Advanced Protection Programme, which requires a physical security key for sign-in and blocks nearly all credential-based attacks. Limit your total number of super admins to two at most: one active, one emergency backup.

Also review which users have delegated admin roles. Workspace allows more granular roles such as User Management Admin or Help Desk Admin — grant those instead of full super admin access wherever possible.

## Enforcing Two-Step Verification Organisation-Wide

According to Google's own data, accounts that use two-step verification (2SV) block over 99% of automated account attacks. Despite this, many small businesses leave 2SV as an optional setting — meaning staff who don't bother to set it up are left fully exposed.

In the Admin Console, you can mandate 2SV for your entire domain. Go to **Security > 2-Step Verification** and set enrollment to "On" with enforcement. You can allow a grace period (typically two weeks) for existing users to comply before locking them out. For users with access to sensitive data — partners, finance staff, executives — consider requiring hardware security keys rather than authenticator apps, which remain susceptible to real-time phishing.

While you're in the security settings, disable SMS-based verification for new enrolments if possible. SMS codes can be intercepted through SIM-swapping attacks, which have been increasingly used against Canadian businesses. Authenticator apps like Google Authenticator or hardware keys are significantly more secure.

## Hardening Gmail Against Phishing and Spoofing

Email remains the primary attack vector for everything from ransomware to business email compromise. Within your Workspace Admin Console, there are several Gmail-specific settings that dramatically reduce your exposure.

First, confirm that SPF, DKIM, and DMARC records are correctly configured for your domain. SPF and DKIM authenticate that your outbound email is genuinely from your organisation; DMARC tells receiving mail servers what to do when they get an email claiming to be from you that fails authentication. Many Ontario businesses have SPF set up but skip DMARC, leaving spoofed emails that impersonate their domain unchallenged. A DMARC policy set to `reject` is the goal — start with `quarantine` if you're uncertain.

Inside the Admin Console, enable **Advanced Phishing and Malware Protection** under Gmail settings. Turn on all the options: protection against anomalous attachment types, protection against emails that spoof employee names, and warnings on emails from untrusted senders. Enable the "Show warning prompt for unauthenticated emails" setting so staff get a visible banner when an external email fails authentication checks. These controls are free and take less than ten minutes to configure.

![A business professional reviewing secure cloud settings on a mobile device](https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop&auto=format)

## Locking Down Google Drive Sharing

Open file sharing is one of the most common — and most overlooked — security gaps in Google Workspace environments. By default, Workspace allows users to share files and folders with "anyone with the link," meaning a document can effectively become publicly accessible on the internet.

In the Admin Console under **Apps > Google Workspace > Drive and Docs > Sharing settings**, change the default sharing to "Off — files cannot be shared outside the domain" and restrict who can change that setting. If you do need to share files with external clients or partners, require users to share with specific email addresses rather than generating open links.

It's also worth running a Drive audit periodically. The Admin Console's Reports section shows files shared externally across your organisation — the results often surprise business owners who assumed their staff were being cautious. As part of your [managed IT services](/services/managed-it/), a good provider will build regular sharing audits into your quarterly IT reviews.

## Reviewing Third-Party App Access

Every time a staff member clicks "Sign in with Google" to access a third-party tool, that app gains some level of access to their Workspace account. Over time, most organisations accumulate dozens of apps — many of them forgotten, some potentially risky — with active access to email, calendar, and Drive data.

In the Admin Console, go to **Security > API Controls** to review which third-party apps have been granted access. You can restrict which apps are allowed to connect to Workspace at all, requiring admin approval before any new OAuth app can access organisational data. At minimum, revoke access from apps that haven't been used in the last 90 days and any tools you don't recognise. If your team uses Workspace integrations heavily, consider setting your default to "restricted," allowing only apps you've explicitly approved.

## Using Audit Logs and Alerts to Stay Ahead of Threats

Even with strong preventative controls in place, ongoing monitoring matters. The Workspace Admin Console includes a Security Dashboard and detailed audit logs for login activity, Drive access, Gmail, and admin changes. Reviewing these logs periodically — or better yet, setting up automated alerts — can surface suspicious behaviour before it becomes a breach.

Set up alert policies for high-risk events such as: a super admin signing in from an unfamiliar location or device, a large volume of files being downloaded or shared externally in a short period, or a user account being suspended or deleted. These alerts go to a nominated admin email address, giving your team a real-time signal when something unusual is happening.

If monitoring and incident response feel like tasks you can't reliably manage in-house, our [cybersecurity services](/services/cybersecurity/) include proactive alerting and regular Workspace security reviews. It's the difference between finding out about a breach from a notification and finding out from a client who received a suspicious email from your domain.

## Getting Started

Google Workspace security hardening doesn't require a large budget or weeks of work. The changes described above can largely be implemented in a single focused session with your Workspace admin. The harder challenge for most Ontario small businesses is simply knowing where to start and having someone accountable for following through.

If you're unsure where your current Workspace environment stands, start with a [free IT assessment](/free-assessment/) — we'll review your cloud environment, identify gaps, and give you a clear list of prioritised fixes. Or [get in touch with our team](/contact/) directly and we can talk through the right approach for your business.

---

## Related Posts

- [Microsoft 365 Security Hardening: A Practical Guide for Ontario Small Businesses](/blog/microsoft-365-security-hardening-guide/)
- [Multi-Factor Authentication (MFA): A Complete Guide for Ontario Small Businesses](/blog/multi-factor-authentication-guide-ontario-businesses/)
- [Shadow IT: The Hidden Cybersecurity Risk Lurking in Your Ontario Business](/blog/shadow-it-risks-ontario-small-businesses/)
