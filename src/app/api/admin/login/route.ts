import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { admins } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';
import { clearRateLimit, clientKey, hitRateLimit, isRateLimited } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const key = clientKey(request, 'login');
  if (isRateLimited(key, 8, 15 * 60_000)) {
    return jsonError('Too many attempts. Try again in 15 minutes.', 429);
  }

  try {
    const body = loginSchema.parse(await request.json());
    if (!db) return jsonError('Database is not configured.', 503);

    const [admin] = await db.select().from(admins).where(eq(admins.email, body.email.toLowerCase())).limit(1);
    if (!admin || !(await bcrypt.compare(body.password, admin.passwordHash))) {
      hitRateLimit(key, 15 * 60_000);
      return jsonError('Email or password is incorrect.', 401);
    }
    clearRateLimit(key);

    const session = await getSession();
    session.adminId = admin.id;
    await session.save();
    return jsonOk({ ok: true });
  } catch {
    return jsonError('Please check your details and try again.', 400);
  }
}
