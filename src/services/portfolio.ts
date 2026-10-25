import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories, offerings, projects, settings, testimonials } from '@/db/schema';
import {
  defaultProfile,
  demoOfferings,
  demoProjects,
  demoTestimonials,
  fallbackCategories,
  parseProfile,
} from '@/domain/content';
import { mapOffering, mapProject, mapTestimonial } from '@/domain/mappers';
import type { Category, Offering, Project, PublicPortfolio, Testimonial } from '@/domain/types';

export async function getPublicPortfolio(): Promise<PublicPortfolio> {
  if (!db) {
    return {
      profile: defaultProfile,
      categories: fallbackCategories,
      projects: demoProjects,
      featured: demoProjects.filter((item) => item.featured),
      offerings: demoOfferings,
      testimonials: demoTestimonials,
    };
  }

  const [projectRows, categoryRows, offeringRows, testimonialRows, profileRow] = await Promise.all([
    db.select().from(projects).where(eq(projects.published, true)).orderBy(asc(projects.sortOrder)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(offerings).where(eq(offerings.published, true)).orderBy(asc(offerings.sortOrder)),
    db.select().from(testimonials).where(eq(testimonials.published, true)).orderBy(asc(testimonials.sortOrder)),
    db.select().from(settings).where(eq(settings.key, 'profile')).limit(1),
  ]);

  const mappedProjects = projectRows.length
    ? projectRows.map((row) => mapProject(row as unknown as Record<string, unknown>))
    : demoProjects;
  const mappedCategories: Category[] = categoryRows.length ? categoryRows : fallbackCategories;
  const mappedOfferings: Offering[] = offeringRows.length
    ? offeringRows.map((row) => mapOffering(row as unknown as Record<string, unknown>))
    : demoOfferings;
  const mappedTestimonials: Testimonial[] = testimonialRows.length
    ? testimonialRows.map((row) => mapTestimonial(row as unknown as Record<string, unknown>))
    : demoTestimonials;
  const featured = mappedProjects.filter((item) => item.featured);

  return {
    profile: parseProfile(profileRow[0]?.value),
    categories: mappedCategories,
    projects: mappedProjects,
    featured: featured.length ? featured : mappedProjects.slice(0, 5),
    offerings: mappedOfferings,
    testimonials: mappedTestimonials,
  };
}

export async function getPublishedProject(slug: string): Promise<{ project: Project; categoryName: string } | null> {
  if (db) {
    const [row] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.published, true)))
      .limit(1);
    if (row) {
      const project = mapProject(row as unknown as Record<string, unknown>);
      let categoryName = 'Selected work';
      if (project.categoryId) {
        const [category] = await db.select().from(categories).where(eq(categories.id, project.categoryId));
        if (category) categoryName = category.name;
      }
      return { project, categoryName };
    }
  }

  const demo = demoProjects.find((item) => item.slug === slug);
  if (!demo) return null;
  const categoryName = fallbackCategories.find((item) => item.id === demo.categoryId)?.name ?? 'Selected work';
  return { project: demo, categoryName };
}
