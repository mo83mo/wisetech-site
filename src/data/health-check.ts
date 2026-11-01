// src/data/health-check.ts
// Free IT & Security Health Check: questions, scoring and grades.
// Shared by the /free-assessment page (instant results) and functions/api/send-assessment.ts
// (emailed report), so both always score the same way. The server only accepts question IDs
// and answers — all wording in emails comes from this file, never from the browser.

export type Answer = 'yes' | 'no' | 'unsure';
export type AreaId = 'accounts' | 'devices' | 'backup' | 'network' | 'people';

export interface HealthArea {
  id: AreaId;
  title: string;
  icon: string;
}

export interface HealthQuestion {
  id: string;
  area: AreaId;
  question: string;
  why: string; // plain-English "why it matters", shown under the question
  fix: string; // recommended next step when the answer is No / Not sure
  weight: 1 | 2 | 3; // 3 = critical, 2 = important, 1 = good practice
}

export const areas: HealthArea[] = [
  { id: 'accounts', title: 'Email & accounts', icon: '🔐' },
  { id: 'devices', title: 'Computers & devices', icon: '💻' },
  { id: 'backup', title: 'Backups & recovery', icon: '💾' },
  { id: 'network', title: 'Network & remote work', icon: '🌐' },
  { id: 'people', title: 'People & preparedness', icon: '👥' },
];

export const questions: HealthQuestion[] = [
  // Email & accounts
  {
    id: 'mfa', area: 'accounts', weight: 3,
    question: 'Does everyone need a code from their phone (multi-factor authentication) to sign in to business email?',
    why: 'Stolen passwords are one of the most common ways attackers get in. A second sign-in step stops most of them.',
    fix: 'Turn on multi-factor authentication for every account, starting with email and admin accounts.',
  },
  {
    id: 'admins', area: 'accounts', weight: 2,
    question: 'Are admin rights for Microsoft 365 or Google Workspace limited to one or two dedicated accounts?',
    why: 'If an everyday account with admin rights is compromised, an attacker can take over the whole company.',
    fix: 'Keep admin rights to a few dedicated, MFA-protected accounts that aren\'t used for daily email.',
  },
  {
    id: 'offboarding', area: 'accounts', weight: 2,
    question: 'When someone leaves, is their access to email, files and apps removed the same day?',
    why: 'Old accounts that stay active are an easy, unnoticed way back into your systems.',
    fix: 'Use a written offboarding checklist that removes access on the employee\'s last day.',
  },
  {
    id: 'email_filtering', area: 'accounts', weight: 2,
    question: 'Is your email protected by business-grade filtering for phishing and dangerous attachments?',
    why: 'Most attacks start with an email. Good filtering stops the majority before anyone can click.',
    fix: 'Add advanced email filtering with link and attachment scanning on top of your built-in spam filter.',
  },
  {
    id: 'business_email', area: 'accounts', weight: 1,
    question: 'Is all company email on a business plan (Microsoft 365 or Google Workspace) rather than personal accounts?',
    why: 'Personal accounts can\'t be secured, managed or recovered by the business when staff change.',
    fix: 'Move all staff to company-owned Microsoft 365 or Google Workspace accounts.',
  },

  // Computers & devices
  {
    id: 'endpoint', area: 'devices', weight: 3,
    question: 'Does every computer have business-grade security software that is monitored centrally (not free or home antivirus)?',
    why: 'Modern threats like ransomware slip past basic antivirus. Monitored protection catches and stops them early.',
    fix: 'Install centrally monitored endpoint protection (EDR) on every computer.',
  },
  {
    id: 'updates', area: 'devices', weight: 3,
    question: 'Are Windows, Mac and other software updates installed on every computer within a few weeks of release?',
    why: 'Attackers target known security holes, often within days of a fix being published.',
    fix: 'Set up managed, automatic patching for operating systems and common apps, with reporting.',
  },
  {
    id: 'encryption', area: 'devices', weight: 2,
    question: 'Are laptops encrypted, so a lost or stolen laptop doesn\'t expose company data?',
    why: 'An unencrypted laptop left in a car can turn into a reportable privacy breach.',
    fix: 'Turn on full-disk encryption (BitLocker or FileVault) and keep the recovery keys stored safely.',
  },
  {
    id: 'inventory', area: 'devices', weight: 1,
    question: 'Do you have an up-to-date list of every computer and phone that can access company data?',
    why: 'You can\'t protect or update devices you don\'t know about.',
    fix: 'Keep a device inventory, ideally generated automatically by your management tools.',
  },

  // Backups & recovery
  {
    id: 'daily_backup', area: 'backup', weight: 3,
    question: 'Are your important files, email and accounting data backed up automatically every day?',
    why: 'Microsoft 365 and Google Workspace don\'t fully back up your data by default. Without backups, deleted or encrypted data may be gone for good.',
    fix: 'Set up automatic daily backups of files, email and line-of-business data.',
  },
  {
    id: 'offsite_backup', area: 'backup', weight: 3,
    question: 'Is at least one backup copy kept off-site or in the cloud, where ransomware can\'t reach it?',
    why: 'Ransomware looks for backups on your network and encrypts them too.',
    fix: 'Keep a separate, immutable (can\'t-be-changed) copy of your backups off-site or in the cloud.',
  },
  {
    id: 'restore_test', area: 'backup', weight: 2,
    question: 'Has anyone actually tested restoring from a backup in the last six months?',
    why: 'Many businesses only discover their backups don\'t work when they need them.',
    fix: 'Test a full restore at least twice a year and record how long it took.',
  },
  {
    id: 'downtime_plan', area: 'backup', weight: 2,
    question: 'If your main system went down tomorrow, do you know how you\'d keep working and how long recovery would take?',
    why: 'Every hour of downtime costs wages, revenue and customer trust.',
    fix: 'Write a simple recovery plan: what gets restored first, who does it, and how long it should take.',
  },

  // Network & remote work
  {
    id: 'firewall', area: 'network', weight: 2,
    question: 'Is your office protected by a business-grade firewall, not just the modem from your internet provider?',
    why: 'Internet provider routers offer basic protection and are rarely monitored or updated.',
    fix: 'Install a managed business firewall with security updates and monitoring.',
  },
  {
    id: 'guest_wifi', area: 'network', weight: 1,
    question: 'Is guest Wi-Fi kept separate from the network your business computers use?',
    why: 'A visitor\'s infected phone or laptop shouldn\'t be able to see your business systems.',
    fix: 'Put guests on a separate Wi-Fi network that can\'t reach business devices.',
  },
  {
    id: 'remote_access', area: 'network', weight: 2,
    question: 'When staff work from home, do they connect securely (for example through a VPN or secured cloud apps)?',
    why: 'Remote desktop and file shares left open to the internet are a favourite target for ransomware gangs.',
    fix: 'Close any open remote access and use a VPN or secured cloud apps with MFA.',
  },

  // People & preparedness
  {
    id: 'training', area: 'people', weight: 2,
    question: 'Have your staff had cybersecurity or phishing training in the last 12 months?',
    why: 'People are the last line of defence. Trained staff spot and report far more scams.',
    fix: 'Run short security awareness training and simulated phishing tests through the year.',
  },
  {
    id: 'passwords', area: 'people', weight: 2,
    question: 'Do staff use a password manager instead of reusing or sharing passwords?',
    why: 'One reused password leaked from another website can unlock your business accounts.',
    fix: 'Roll out a business password manager and stop shared or reused passwords.',
  },
  {
    id: 'incident_plan', area: 'people', weight: 2,
    question: 'If you were hit by ransomware or a fake invoice scam today, do you know exactly who to call and what to do?',
    why: 'The first hour of an incident decides how much damage it does.',
    fix: 'Create a one-page incident plan with contacts, first steps and who makes decisions.',
  },
  {
    id: 'cyber_insurance', area: 'people', weight: 1,
    question: 'Do you have cyber insurance, and could you show your insurer the security controls it asks about?',
    why: 'Insurers now require controls like MFA and backups — and can refuse claims when they\'re missing.',
    fix: 'Review your policy\'s security requirements and document the controls you have in place.',
  },
];

// Optional context questions — used to tailor the follow-up, not the score
export const teamSizes = ['1–4', '5–19', '20–49', '50–99', '100+'];
export const industries = [
  'Accounting & Finance', 'Dental & Healthcare', 'Education', 'Hospitality', 'Law Firm',
  'Manufacturing', 'Real Estate', 'Retail & E-Commerce', 'Construction', 'Non-profit', 'Other',
];
export const itSupportOptions = [
  'We handle it ourselves',
  'A staff member, part-time',
  'An outside IT company',
  'An in-house IT team',
];

export interface HealthResult {
  pct: number; // 0–100, weighted
  answered: number;
  areaScores: { area: HealthArea; pct: number; yes: number; total: number }[];
  gaps: HealthQuestion[]; // No / Not sure, highest risk first
  unsure: HealthQuestion[];
  inPlace: HealthQuestion[];
}

export function scoreAnswers(answers: Record<string, Answer | undefined>): HealthResult {
  const totalWeight = questions.reduce((n, q) => n + q.weight, 0);
  let earned = 0;
  let answered = 0;
  const gaps: HealthQuestion[] = [];
  const unsure: HealthQuestion[] = [];
  const inPlace: HealthQuestion[] = [];

  for (const q of questions) {
    const a = answers[q.id];
    if (a) answered++;
    if (a === 'yes') {
      earned += q.weight;
      inPlace.push(q);
    } else if (a === 'no' || a === 'unsure') {
      gaps.push(q);
      if (a === 'unsure') unsure.push(q);
    }
  }

  const areaScores = areas.map(area => {
    const qs = questions.filter(q => q.area === area.id);
    const weight = qs.reduce((n, q) => n + q.weight, 0);
    const got = qs.filter(q => answers[q.id] === 'yes').reduce((n, q) => n + q.weight, 0);
    return { area, pct: Math.round((got / weight) * 100), yes: qs.filter(q => answers[q.id] === 'yes').length, total: qs.length };
  });

  // Highest-risk gaps first; ties keep question order
  gaps.sort((a, b) => b.weight - a.weight || questions.indexOf(a) - questions.indexOf(b));

  return { pct: Math.round((earned / totalWeight) * 100), answered, areaScores, gaps, unsure, inPlace };
}

export function gradeFor(pct: number) {
  if (pct >= 85) return { label: 'Strong', tone: 'good', message: 'You have strong foundations in place. A quick professional review can confirm nothing has been missed.' };
  if (pct >= 65) return { label: 'Fair', tone: 'fair', message: 'Good basics, with a few gaps worth closing — the priorities below are the ones that matter most.' };
  if (pct >= 40) return { label: 'At risk', tone: 'risk', message: 'Several important protections are missing or unconfirmed. Fixing the top priorities below would make the biggest difference.' };
  return { label: 'High risk', tone: 'high', message: 'Key protections are missing or unconfirmed. The good news: the top priorities below are usually quick to put in place.' };
}
