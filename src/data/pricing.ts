// src/data/pricing.ts
// Plans, add-ons and pricing FAQs. Used by the pricing page and the AI chat assistant.

// Published per-user prices cover teams of 5–49 users. At this size and above, the pricing page
// stops showing totals and offers the Enterprise plan (custom, volume-based pricing) instead.
export const enterpriseMinUsers = 50;

export const enterprisePlan = {
  name: 'Enterprise',
  audience: `${enterpriseMinUsers}+ users or multiple locations`,
  summary: 'Volume pricing and a plan shaped around your organisation, quoted after a free assessment.',
  features: [
    'Services from any plan, combined for your organisation',
    `Volume pricing for ${enterpriseMinUsers}+ users`,
    'Co-managed option — we work alongside your in-house IT team',
    'Mix plans by team, department or location',
    'Phased onboarding and rollout plan',
  ],
};

export const plans = [
  {
    name: 'Essential',
    monthlyPrice: 99,
    annualMonthlyEquiv: 83,
    annualYearlyTotal: 990,
    annualSavings: 198,
    minUsers: 5,
    bestFor: 'Small teams, low IT risk',
    features: [
      'Remote helpdesk (Mon–Fri 8am–6pm)',
      'Patch management & updates',
      'Endpoint antivirus & firewall',
      '24/7 remote monitoring',
      'Email security & spam filtering',
      'Cloud backup (daily)',
    ],
    notIncluded: [
      'On-site support',
      'Advanced EDR / MDR',
      'vCIO / IT strategy',
    ],
    isPopular: false,
  },
  {
    name: 'Professional',
    monthlyPrice: 149,
    annualMonthlyEquiv: 124,
    annualYearlyTotal: 1490,
    annualSavings: 298,
    minUsers: 5,
    bestFor: 'Most Mississauga SMBs',
    features: [
      'Everything in Essential',
      '24/7 helpdesk support',
      'Advanced EDR (endpoint detection)',
      'Microsoft 365 / Google Workspace admin',
      'Security awareness training (quarterly)',
      'On-site support (2 visits/month per client)',
      'Disaster recovery planning',
      'Quarterly business review',
    ],
    notIncluded: [
      'MDR / compliance reporting',
    ],
    isPopular: true,
  },
  {
    name: 'Advanced',
    monthlyPrice: 199,
    annualMonthlyEquiv: 166,
    annualYearlyTotal: 1990,
    annualSavings: 398,
    minUsers: 5,
    bestFor: 'Legal, dental, accounting firms',
    features: [
      'Everything in Professional',
      'Managed Detection & Response (MDR)',
      'Compliance support (PHIPA, PIPEDA)',
      'vCIO — IT strategy & roadmap',
      'Unlimited on-site support',
      'Cyber insurance documentation',
      '1-hour SLA for critical issues',
      'Monthly executive reports',
    ],
    isPopular: false,
  },
];

export const addons = [
  { name: 'VoIP & Unified Communications', price: 'From $15/user/month' },
  { name: 'CCTV Installation & Service', price: 'Project-based quote' },
  { name: 'Cloud Migration', price: 'Project-based quote' },
  { name: 'Network Installation', price: 'Project-based quote' },
];

export const pricingFaqs = [
  {
    question: 'What size of business do you work with?',
    answer: 'WiseTech is built for small and medium-sized businesses, and we never turn a business away because of its size. The prices on this page cover teams of 5–49 users. Organisations with 50 or more users — or several locations — are on our Enterprise plan, with volume pricing and a tailored proposal after a free assessment.',
  },
  {
    question: 'Is there a setup or onboarding fee?',
    answer: 'WiseTech charges a one-time onboarding fee to cover the initial environment assessment, documentation, and configuration of monitoring and security tools. The fee varies based on the number of users and complexity of your environment. We will provide a clear quote before you sign anything.',
  },
  {
    question: 'What is the minimum contract length?',
    answer: 'Our standard agreements are month-to-month on the monthly billing plan, or 12 months on the annual plan. Annual contracts receive the equivalent of 2 months free. There are no penalties for leaving after your agreed term.',
  },
  {
    question: 'Can I change plans after signing up?',
    answer: 'Yes. You can upgrade to a higher tier at any time — the new rate takes effect at the start of the next billing cycle. Downgrading is available at renewal. If your business needs change significantly, contact us and we will find the right solution.',
  },
  {
    question: 'What happens if I need to add more users?',
    answer: 'Adding users is straightforward — we simply pro-rate the additional users at your current plan rate for the remainder of the month, then include them in full from the next billing cycle. There is no minimum notice period for adding users.',
  },
  {
    question: 'Do your plans cover remote workers?',
    answer: 'Yes. All WiseTech plans support remote and hybrid workforces. Remote workers receive the same helpdesk support, endpoint protection, and monitoring as office-based staff. For on-site visits, we cover the Mississauga and GTA area.',
  },
];
