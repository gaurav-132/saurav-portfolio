import { asc, eq } from 'drizzle-orm';
import { testimonials } from '@/db/schema';
import { mapTestimonial } from '@/domain/mappers';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { idBody, testimonialInput } from '@/lib/validation';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  const rows = await context.db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
  return jsonOk(rows.map((row) => mapTestimonial(row as unknown as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const input = testimonialInput.parse(await request.json());
    const [item] = await context.db.insert(testimonials).values({ ...input, role: input.role || '' }).returning();
    return jsonOk(mapTestimonial(item as unknown as Record<string, unknown>), 201);
  } catch {
    return jsonError('Invalid testimonial.', 400);
  }
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const body = await request.json();
    const { id } = idBody.parse(body);
    const input = testimonialInput.partial().parse(body);
    const [item] = await context.db.update(testimonials).set(input).where(eq(testimonials.id, id)).returning();
    return item
      ? jsonOk(mapTestimonial(item as unknown as Record<string, unknown>))
      : jsonError('Testimonial not found.', 404);
  } catch {
    return jsonError('Invalid testimonial details.', 400);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const { id } = idBody.parse(await request.json());
    await context.db.delete(testimonials).where(eq(testimonials.id, id));
    return jsonOk({ ok: true });
  } catch {
    return jsonError('Could not delete testimonial.', 400);
  }
}
