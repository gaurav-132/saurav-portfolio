import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories, inquiries, offerings, projects, settings, testimonials } from '@/db/schema';
import { defaultProfile, parseProfile } from '@/domain/content';
import { mapInquiry, mapOffering, mapProject, mapTestimonial } from '@/domain/mappers';
import type { AdminWorkspace, SiteProfile } from '@/domain/types';

export async function getAdminWorkspace(): Promise<AdminWorkspace> {
  if (!db) {
    return {
      projects: [],
      categories: [],
      inquiries: [],
      testimonials: [],
      offerings: [],
      profile: defaultProfile,
    };
  }

  const [projectRows, categoryRows, inquiryRows, testimonialRows, offeringRows, profileRow] = await Promise.all([
    db.select().from(projects).orderBy(desc(projects.updatedAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)),
    db.select().from(offerings).orderBy(asc(offerings.sortOrder)),
    db.select().from(settings).where(eq(settings.key, 'profile')).limit(1),
  ]);

  return {
    projects: projectRows.map((row) => mapProject(row as unknown as Record<string, unknown>)),
    categories: categoryRows,
    inquiries: inquiryRows.map((row) => mapInquiry(row as unknown as Record<string, unknown>)),
    testimonials: testimonialRows.map((row) => mapTestimonial(row as unknown as Record<string, unknown>)),
    offerings: offeringRows.map((row) => mapOffering(row as unknown as Record<string, unknown>)),
    profile: parseProfile(profileRow[0]?.value),
  };
}

export async function saveProfile(profile: SiteProfile) {
  if (!db) throw new Error('Database is not configured.');
  await db
    .insert(settings)
    .values({ key: 'profile', value: JSON.stringify(profile) })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(profile) } });
  return profile;
}
