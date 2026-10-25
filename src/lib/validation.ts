import { z } from 'zod';
import { leadStatuses } from '@/domain/types';

const optionalUrl = z.string().url().or(z.literal(''));
const demoThumb = z.string().regex(/^\/demo\/[a-z0-9-]+\.svg$/);

export const projectInput = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().max(180).optional(),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  thumbnail: z.string().url().or(demoThumb).or(z.literal('')).optional(),
  videoUrl: optionalUrl.optional(),
  clientName: z.string().max(120).optional(),
  year: z.string().max(12).optional(),
  duration: z.string().max(24).optional(),
  role: z.string().max(80).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const categoryInput = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().max(100).optional(),
  sortOrder: z.number().int().optional(),
});

export const inquiryCreate = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(24).regex(/^[+()\d .-]+$/),
  message: z.string().trim().min(10).max(4000),
});

export const inquiryUpdate = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  email: z.email().max(254).optional(),
  phone: z.string().min(1).max(40).optional(),
  message: z.string().min(1).max(5000).optional(),
  status: z.enum(leadStatuses).optional(),
  notes: z.string().max(4000).optional(),
  isRead: z.boolean().optional(),
});

export const testimonialInput = z.object({
  quote: z.string().min(8).max(600),
  author: z.string().min(1).max(80),
  role: z.string().max(120).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const offeringInput = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(400).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const profileInput = z.object({
  displayName: z.string().min(1).max(80),
  roleTitle: z.string().max(80),
  location: z.string().max(80),
  heroEyebrow: z.string().max(80),
  heroHeadline: z.string().min(1).max(160),
  heroHighlight: z.string().max(80),
  heroCopy: z.string().max(600),
  aboutEyebrow: z.string().max(80),
  aboutTitle: z.string().max(160),
  aboutParagraphs: z.array(z.string().max(800)).max(4),
  tools: z.array(z.string().max(40)).max(12),
  process: z.array(z.object({ title: z.string().max(40), copy: z.string().max(280) })).max(6),
  contactEyebrow: z.string().max(80),
  contactTitle: z.string().max(120),
  contactCopy: z.string().max(400),
  email: z.string().max(254),
  instagram: z.string().max(120),
});

export const idBody = z.object({ id: z.string().uuid() });
