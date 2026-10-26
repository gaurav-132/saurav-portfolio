import { desc, eq } from 'drizzle-orm';
import { projects } from '@/db/schema';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { slugify } from '@/lib/slug';
import { idBody, projectInput, projectPlaybackInput } from '@/lib/validation';
import { mapProject } from '@/domain/mappers';
import { deleteMediaIfUnused, objectKeyFromMediaUrl } from '@/lib/object-storage';

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
    const playback = projectPlaybackInput.parse(input);
    const [item] = await context.db
      .insert(projects)
      .values({
        ...input,
        playbackSource: playback.playbackSource,
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
    return jsonError('Check the project fields, video source, and slug, then try again.', 400);
  }
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id, ...input } = await request.json();
    const partial = projectInput.partial().parse(input);
    const [previous] = await context.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!previous) return jsonError('Project not found.', 404);
    const parsed = projectInput.parse({ ...previous, ...partial });
    const playback = projectPlaybackInput.parse(parsed);
    const [item] = await context.db
      .update(projects)
      .set({
        ...parsed,
        playbackSource: playback.playbackSource,
        ...(parsed.slug || parsed.title ? { slug: slugify(parsed.slug || parsed.title!) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    if (item && previous) {
      const oldKeys = new Set([previous.thumbnail, previous.videoUrl].map(objectKeyFromMediaUrl).filter((key): key is string => Boolean(key)));
      for (const key of oldKeys) await deleteMediaIfUnused(context.db, key);
    }
    return item
      ? jsonOk(mapProject(item as unknown as Record<string, unknown>))
      : jsonError('Project not found.', 404);
  } catch {
    return jsonError('Check the project fields and provide a video URL for the selected playback source.', 400);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id } = idBody.parse(await request.json());
    const [previous] = await context.db.delete(projects).where(eq(projects.id, id)).returning();
    if (previous) {
      const oldKeys = new Set([previous.thumbnail, previous.videoUrl].map(objectKeyFromMediaUrl).filter((key): key is string => Boolean(key)));
      for (const key of oldKeys) await deleteMediaIfUnused(context.db, key);
    }
    return jsonOk({ ok: true });
  } catch {
    return jsonError('Could not delete project.', 400);
  }
}
