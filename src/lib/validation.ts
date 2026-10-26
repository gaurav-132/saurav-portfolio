import { z } from 'zod';
import { leadStatuses } from '@/domain/types';

const httpUrl = z.string().url().max(2048).refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}, 'Use a valid http or https URL.');
const optionalUrl = httpUrl.or(z.literal(''));
const demoThumb = z.string().regex(/^\/demo\/[a-z0-9-]+\.svg$/);
const internalMediaUrl = z.string().regex(/^\/api\/media\?key=portfolio%2F[A-Za-z0-9._%-]+$/);

export const projectInput = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z.string().max(180).optional(),
  description: z.string().trim().min(1, 'Add a project description.').max(5000),
  categoryId: z.string().uuid().nullable(),
  thumbnail: httpUrl.or(demoThumb).or(internalMediaUrl),
  videoUrl: optionalUrl.or(internalMediaUrl),
  actualVideoUrl: optionalUrl,
  playbackSource: z.enum(['uploaded', 'external']),
  clientName: z.string().max(120),
  year: z.string().regex(/^(19|20|21)\d{2}$/, 'Enter a valid four-digit year.').refine((value) => Number(value) <= new Date().getFullYear() + 1, 'Year cannot be more than one year in the future.'),
  duration: z.string().max(24),
  role: z.string().max(80),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const projectPlaybackInput = z.object({
  videoUrl: optionalUrl.or(internalMediaUrl),
  actualVideoUrl: optionalUrl.optional(),
  playbackSource: z.enum(['uploaded', 'external']).default('uploaded'),
}).superRefine((project, context) => {
  if (project.playbackSource === 'external' && !project.actualVideoUrl) {
    context.addIssue({ code: 'custom', path: ['actualVideoUrl'], message: 'An external video link is required for external playback.' });
  }
});

export const categoryInput = z.object({
  name: z.string().trim().min(1).max(80),
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
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(24).regex(/^[+()\d .-]+$/),
  message: z.string().trim().min(10).max(4000),
  status: z.enum(leadStatuses),
  notes: z.string().max(4000).optional(),
  isRead: z.boolean().optional(),
});

export const testimonialInput = z.object({
  quote: z.string().trim().min(8).max(600),
  author: z.string().trim().min(1).max(80),
  role: z.string().max(120).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const offeringInput = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().max(400).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const profileInput = z.object({
  displayName: z.string().trim().min(1).max(80),
  roleTitle: z.string().max(80),
  location: z.string().max(80),
  heroEyebrow: z.string().max(80),
  heroHeadline: z.string().trim().min(1).max(160),
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
  email: z.union([z.email().max(254), z.literal('')]),
  instagram: z.string().max(120),
});

export const idBody = z.object({ id: z.string().uuid() });
