import type { Inquiry, LeadStatus, Offering, Project, Testimonial } from './types';
import { leadStatuses } from './types';

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function bool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function num(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function status(value: unknown): LeadStatus {
  return leadStatuses.includes(value as LeadStatus) ? (value as LeadStatus) : 'new';
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: text(row.id),
    title: text(row.title),
    slug: text(row.slug),
    description: text(row.description),
    categoryId: row.categoryId == null ? null : text(row.categoryId),
    thumbnail: text(row.thumbnail),
    videoUrl: text(row.videoUrl),
    actualVideoUrl: text(row.actualVideoUrl),
    playbackSource: row.playbackSource === 'external' || (!('playbackSource' in row) && Boolean(row.actualVideoUrl)) ? 'external' : 'uploaded',
    clientName: text(row.clientName),
    year: text(row.year),
    duration: text(row.duration),
    role: text(row.role, 'Editor'),
    featured: bool(row.featured),
    published: bool(row.published),
    sortOrder: num(row.sortOrder),
  };
}

export function mapInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: text(row.id),
    name: text(row.name),
    email: text(row.email),
    phone: text(row.phone),
    message: text(row.message),
    status: status(row.status),
    notes: text(row.notes),
    isRead: bool(row.isRead),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt ?? row.createdAt),
  };
}

export function mapTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: text(row.id),
    quote: text(row.quote),
    author: text(row.author),
    role: text(row.role),
    published: bool(row.published, true),
    sortOrder: num(row.sortOrder),
  };
}

export function mapOffering(row: Record<string, unknown>): Offering {
  return {
    id: text(row.id),
    title: text(row.title),
    description: text(row.description),
    published: bool(row.published, true),
    sortOrder: num(row.sortOrder),
  };
}
