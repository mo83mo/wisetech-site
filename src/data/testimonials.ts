// src/data/testimonials.ts
// Real client testimonials only — never invented or paraphrased beyond what the client approved.
// Get written permission before publishing a name or company. The Testimonials section
// stays hidden on the site until this list has at least one entry.
//
// Example entry:
// {
//   quote: 'Since moving to WiseTech our team stopped losing hours to IT problems.',
//   name: 'Jane Smith',
//   role: 'Office Manager',
//   company: 'Smith & Co. Accounting',
//   city: 'Mississauga',
// },

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  city?: string;
}

export const testimonials: Testimonial[] = [];
