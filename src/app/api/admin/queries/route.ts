import { desc, eq } from 'drizzle-orm';
import { inquiries } from '@/db/schema';
import { mapInquiry } from '@/domain/mappers';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { idBody, inquiryUpdate } from '@/lib/validation';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  const rows = await context.db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  return jsonOk(rows.map((row) => mapInquiry(row as unknown as Record<string, unknown>)));
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id, ...input } = inquiryUpdate.parse(await request.json());
    const [item] = await context.db
      .update(inquiries)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return item
      ? jsonOk(mapInquiry(item as unknown as Record<string, unknown>))
      : jsonError('Query not found.', 404);
  } catch {
    return jsonError('Invalid query details.', 400);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id } = idBody.parse(await request.json());
    const [deleted] = await context.db.delete(inquiries).where(eq(inquiries.id, id)).returning({ id: inquiries.id });
    return deleted ? jsonOk({ ok: true }) : jsonError('Query not found.', 404);
  } catch {
    return jsonError('Could not delete the query.', 400);
  }
}
