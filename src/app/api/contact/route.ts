import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/schema';

const attempts = new Map<string, { count: number; started: number }>();
const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(24).regex(/^[+()\d .-]+$/),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const now = Date.now();
  const previous = attempts.get(ip);
  if (previous && now - previous.started < 60_000 && previous.count >= 5) {
    return NextResponse.json({ error: 'Please wait a minute before sending another query.' }, { status: 429 });
  }
  try {
    const inquiry = inquirySchema.parse(await req.json());
    if (!db) return NextResponse.json({ error: 'The contact inbox is not configured yet. Please check back soon.' }, { status: 503 });
    await db.insert(inquiries).values(inquiry);
    attempts.set(ip, { count: (previous?.count ?? 0) + 1, started: previous?.started ?? now });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Please check each field and try again.' : 'Your query could not be saved. Please try again.' }, { status: 400 });
  }
}
