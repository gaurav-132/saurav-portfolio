import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => [index('categories_sort_idx').on(table.sortOrder)],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').default('').notNull(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    thumbnail: text('thumbnail').default('').notNull(),
    videoUrl: text('video_url').default('').notNull(),
    clientName: text('client_name').default('').notNull(),
    year: text('year').default('').notNull(),
    duration: text('duration').default('').notNull(),
    role: text('role').default('Editor').notNull(),
    featured: boolean('featured').default(false).notNull(),
    published: boolean('published').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('projects_published_sort_idx').on(table.published, table.sortOrder),
    index('projects_category_idx').on(table.categoryId),
    index('projects_featured_idx').on(table.featured),
  ],
);

export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    message: text('message').notNull(),
    status: text('status').default('new').notNull(),
    notes: text('notes').default('').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('inquiries_status_created_idx').on(table.status, table.createdAt),
    index('inquiries_unread_idx').on(table.isRead),
  ],
);

export const testimonials = pgTable(
  'testimonials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quote: text('quote').notNull(),
    author: text('author').notNull(),
    role: text('role').default('').notNull(),
    published: boolean('published').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('testimonials_published_sort_idx').on(table.published, table.sortOrder)],
);

export const offerings = pgTable(
  'offerings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description').default('').notNull(),
    published: boolean('published').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => [index('offerings_published_sort_idx').on(table.published, table.sortOrder)],
);

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const categoryRelations = relations(categories, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one }) => ({
  category: one(categories, {
    fields: [projects.categoryId],
    references: [categories.id],
  }),
}));
