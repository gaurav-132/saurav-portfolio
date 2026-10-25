import bcrypt from 'bcryptjs';
import { count, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { admins } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';

const bodySchema = z.object({
  token: z.string().min(1),
  email: z.email(),
  password: z.string().min(12).max(128),
});

function unavailable(message: string) {
  return jsonError(message, 503);
}

export async function GET() {
  if (!db) return unavailable('Add DATABASE_URL to the server environment, then restart the app.');
  if (!process.env.ADMIN_SETUP_TOKEN) {
    return unavailable('Add ADMIN_SETUP_TOKEN to the server environment before creating the first admin.');
  }

  try {
    const [row] = await db.select({ count: count() }).from(admins);
    if (row.count > 0) {
      return jsonError('An administrator is already configured. Sign in instead.', 409);
    }
    if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
      return unavailable('Add a SESSION_SECRET of at least 32 characters to the server environment.');
    }
    return jsonOk({ ready: true });
  } catch {
    return unavailable('The admin table is unavailable. Run the database migrations, then try again.');
  }
}

export async function POST(request: Request) {
  if (!db) return unavailable('Add DATABASE_URL to the server environment, then restart the app.');
  if (!process.env.ADMIN_SETUP_TOKEN) {
    return unavailable('Add ADMIN_SETUP_TOKEN to the server environment before creating the first admin.');
  }
  if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
    return unavailable('Add a SESSION_SECRET of at least 32 characters to the server environment.');
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return jsonError('Enter a valid email, the setup token, and a password with at least 12 characters.', 400);
  }

  if (body.token !== process.env.ADMIN_SETUP_TOKEN) {
    return jsonError('The setup token is incorrect.', 403);
  }

  try {
    const admin = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(74120319)`);
      const [row] = await tx.select({ count: count() }).from(admins);
      if (row.count > 0) return null;
      const [created] = await tx
        .insert(admins)
        .values({
          email: body.email.toLowerCase(),
          passwordHash: await bcrypt.hash(body.password, 12),
        })
        .returning();
      return created;
    });

    if (!admin) {
      return jsonError('An administrator is already configured. Sign in instead.', 409);
    }

    const session = await getSession();
    session.adminId = admin.id;
    await session.save();
    return jsonOk({ ok: true });
  } catch {
    return unavailable('Setup failed. Check the database connection and migrations, then try again.');
  }
}
