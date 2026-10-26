import { asc, eq } from 'drizzle-orm';
import { offerings } from '@/db/schema';
import { mapOffering } from '@/domain/mappers';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { idBody, offeringInput } from '@/lib/validation';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  const rows = await context.db.select().from(offerings).orderBy(asc(offerings.sortOrder));
  return jsonOk(rows.map((row) => mapOffering(row as unknown as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const input = offeringInput.parse(await request.json());
    const [item] = await context.db
      .insert(offerings)
      .values({ ...input, description: input.description || '' })
      .returning();
    return jsonOk(mapOffering(item as unknown as Record<string, unknown>), 201);
  } catch {
    return jsonError('Invalid service offering.', 400);
  }
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const body = await request.json();
    const { id } = idBody.parse(body);
    const input = offeringInput.parse(body);
    const [item] = await context.db.update(offerings).set(input).where(eq(offerings.id, id)).returning();
    return item
      ? jsonOk(mapOffering(item as unknown as Record<string, unknown>))
      : jsonError('Service not found.', 404);
  } catch {
    return jsonError('Invalid service details.', 400);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id } = idBody.parse(await request.json());
    await context.db.delete(offerings).where(eq(offerings.id, id));
    return jsonOk({ ok: true });
  } catch {
    return jsonError('Could not delete service.', 400);
  }
}
