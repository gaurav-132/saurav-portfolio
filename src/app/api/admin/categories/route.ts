import { asc, eq } from 'drizzle-orm';
import { categories } from '@/db/schema';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { slugify } from '@/lib/slug';
import { categoryInput, idBody } from '@/lib/validation';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  return jsonOk(await context.db.select().from(categories).orderBy(asc(categories.sortOrder)));
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const input = categoryInput.parse(await request.json());
    const [item] = await context.db
      .insert(categories)
      .values({ name: input.name, slug: slugify(input.slug || input.name), sortOrder: input.sortOrder ?? 0 })
      .returning();
    return jsonOk(item, 201);
  } catch {
    return jsonError('Invalid category or slug already exists.', 400);
  }
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const body = await request.json();
    const input = categoryInput.parse(body);
    const { id } = idBody.parse(body);
    const [item] = await context.db
      .update(categories)
      .set({ name: input.name, slug: slugify(input.slug || input.name), sortOrder: input.sortOrder ?? 0 })
      .where(eq(categories.id, id))
      .returning();
    return jsonOk(item);
  } catch {
    return jsonError('Invalid category details.', 400);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id } = idBody.parse(await request.json());
    await context.db.delete(categories).where(eq(categories.id, id));
    return jsonOk({ ok: true });
  } catch {
    return jsonError('Could not delete category.', 400);
  }
}
