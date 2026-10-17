import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/schema';
import { z } from 'zod';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!db) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  return NextResponse.json(await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)));
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const input = await req.json();
    if (!db) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
    const idOnly = z.object({ id: z.string().uuid(), isRead: z.boolean() }).safeParse(input);
    if (idOnly.success) {
      const [item] = await db.update(inquiries).set({ isRead: idOnly.data.isRead }).where(eq(inquiries.id, idOnly.data.id)).returning();
      return item ? NextResponse.json(item) : NextResponse.json({ error: 'Query not found.' }, { status: 404 });
    }
    const update = z.object({ id: z.string().uuid(), name: z.string().min(1).max(120), email: z.string().email().max(254), phone: z.string().min(1).max(40), message: z.string().min(1).max(5000) }).safeParse(input);
    if (!update.success) return NextResponse.json({ error: 'Invalid query details.' }, { status: 400 });
    const [item] = await db.update(inquiries).set({ name: update.data.name, email: update.data.email, phone: update.data.phone, message: update.data.message }).where(eq(inquiries.id, update.data.id)).returning();
    return item ? NextResponse.json(item) : NextResponse.json({ error: 'Query not found.' }, { status: 404 });
  } catch { return NextResponse.json({ error: 'Could not update the query.' }, { status: 400 }); }
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(await req.json());
    if (!db) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
    const [deleted] = await db.delete(inquiries).where(eq(inquiries.id, id)).returning({ id: inquiries.id });
    return deleted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Query not found.' }, { status: 404 });
  } catch { return NextResponse.json({ error: 'Could not delete the query.' }, { status: 400 }); }
}
