import { desc, eq } from 'drizzle-orm';
import { projects } from '@/db/schema';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { slugify } from '@/lib/slug';
import { idBody, projectInput } from '@/lib/validation';
import { mapProject } from '@/domain/mappers';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  const rows = await context.db.select().from(projects).orderBy(desc(projects.updatedAt));
  return jsonOk(rows.map((row) => mapProject(row as unknown as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const input = projectInput.parse(await request.json());
    const [item] = await context.db
      .insert(projects)
      .values({
        ...input,
        slug: slugify(input.slug || input.title),
        description: input.description || '',
        clientName: input.clientName || '',
        year: input.year || '',
        duration: input.duration || '',
        role: input.role || 'Editor',
      })
      .returning();
    return jsonOk(mapProject(item as unknown as Record<string, unknown>), 201);
  } catch {
    return jsonError('Invalid project or slug already exists.', 400);
  }
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id, ...input } = await request.json();
    const parsed = projectInput.partial().parse(input);
    const [item] = await context.db
      .update(projects)
      .set({
        ...parsed,
        ...(parsed.slug || parsed.title ? { slug: slugify(parsed.slug || parsed.title!) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return item
      ? jsonOk(mapProject(item as unknown as Record<string, unknown>))
      : jsonError('Project not found.', 404);
  } catch {
    return jsonError('Invalid project details.', 400);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id } = idBody.parse(await request.json());
    await context.db.delete(projects).where(eq(projects.id, id));
    return jsonOk({ ok: true });
  } catch {
    return jsonError('Could not delete project.', 400);
  }
}
