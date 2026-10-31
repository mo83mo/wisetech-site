// src/data/site.ts
// Business details used across the site. Edit here, not in individual pages.

export const site = {
  phone: '888-445-9473',
  phoneHref: 'tel:8884459473',
  email: 'Info@wisetech.ca',

  // Founder note (homepage + About). No photo by design — the initial is shown instead.
  founderName: 'Mo',
  founderTitle: 'Founder, WiseTech Inc.',

  // Paste a Microsoft Bookings / Cal.com link here to show "Pick a time" buttons.
  // Leave empty and the site falls back to the contact form.
  bookingUrl: '',
};

// Options in the contact form's "How can we help?" dropdown.
// `slug` lets service pages and blog posts pre-select the right option via /contact/?service=<slug>.
export const contactTopics = [
  { slug: 'managed-it', label: 'Managed IT Services' },
  { slug: 'cybersecurity', label: 'Cybersecurity' },
  { slug: 'backup-disaster-recovery', label: 'Backup & Disaster Recovery' },
  { slug: 'cloud-solutions', label: 'Cloud Solutions (M365 / Google Workspace)' },
  { slug: 'network-infrastructure', label: 'Network & Infrastructure' },
  { slug: 'it-consulting', label: 'IT Consulting & Strategy' },
  { slug: 'voip-communications', label: 'VoIP & Communications' },
  { slug: 'cctv-surveillance', label: 'CCTV & Surveillance' },
  { slug: 'support', label: 'Support for an existing client' },
  { slug: 'advice', label: 'Not sure — just want advice' },
];

export const contactHref = (topic?: string) => (topic ? `/contact/?service=${topic}` : '/contact/');
