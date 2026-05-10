// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const featureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const heroSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  photo: z.string(),
  photoAlt: z.string(),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    hero: heroSchema,
    trustBar: z.array(z.string()).length(4),
    features: z.array(featureSchema),
    bodyTitle: z.string(),
    faqs: z.array(faqSchema).min(3).max(5),
    ctaHeadline: z.string(),
    ctaSubtext: z.string(),
    serviceSchema: z.object({
      serviceType: z.string(),
      description: z.string(),
    }),
  }),
});

const industries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    hero: heroSchema,
    trustBar: z.array(z.string()).length(4),
    features: z.array(featureSchema),
    bodyTitle: z.string(),
    faqs: z.array(faqSchema).min(3).max(5),
    ctaHeadline: z.string(),
    ctaSubtext: z.string(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    category: z.enum(['Cybersecurity', 'Cloud', 'IT Tips', 'Industry News']),
    author: z.string().default('WiseTech Team'),
    readTime: z.number(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { services, industries, blog };
