import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { count, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { admins } from '@/lib/schema';
import { getSession } from '@/lib/auth';

const bodySchema = z.object({
  token: z.string().min(1),
  email: z.email(),
  password: z.string().min(12).max(128),
});

function unavailable(message: string) {
  return NextResponse.json({ error: message }, { status: 503 });
}

/** Public readiness check. It reports setup state, never environment values. */
export async function GET() {
  if (!db) return unavailable('Add DATABASE_URL to the server environment, then restart the app.');
  if (!process.env.ADMIN_SETUP_TOKEN) return unavailable('Add ADMIN_SETUP_TOKEN to the server environment before creating the first admin.');

  try {
    const [row] = await db.select({ count: count() }).from(admins);
    if (row.count > 0) {
      return NextResponse.json({ ready: false, error: 'An administrator is already configured. Sign in instead.' }, { status: 409 });
    }
    if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
      return unavailable('Add a SESSION_SECRET of at least 32 characters to the server environment.');
    }
    return NextResponse.json({ ready: true });
  } catch {
    return unavailable('The admin table is unavailable. Run the database migrations, then try again.');
  }
}

export async function POST(req: Request) {
  if (!db) return unavailable('Add DATABASE_URL to the server environment, then restart the app.');
  if (!process.env.ADMIN_SETUP_TOKEN) return unavailable('Add ADMIN_SETUP_TOKEN to the server environment before creating the first admin.');
  if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
    return unavailable('Add a SESSION_SECRET of at least 32 characters to the server environment.');
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Enter a valid email, the setup token, and a password with at least 12 characters.' }, { status: 400 });
  }

  if (body.token !== process.env.ADMIN_SETUP_TOKEN) {
    return NextResponse.json({ error: 'The setup token is incorrect.' }, { status: 403 });
  }

  try {
    const admin = await db.transaction(async (tx) => {
      // Serialize first-admin creation so two simultaneous requests cannot both pass the count check.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(74120319)`);
      const [row] = await tx.select({ count: count() }).from(admins);
      if (row.count > 0) return null;
      const [created] = await tx.insert(admins).values({
        email: body.email.toLowerCase(),
        passwordHash: await bcrypt.hash(body.password, 12),
      }).returning();
      return created;
    });
    if (!admin) {
      return NextResponse.json({ error: 'An administrator is already configured. Sign in instead.' }, { status: 409 });
    }
    const session = await getSession();
    session.adminId = admin.id;
    await session.save();
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable('Setup failed. Check the database connection and migrations, then try again.');
  }
}
