import { db } from '@/db/client';
import { requireAdmin } from '@/lib/auth';
import { jsonError } from '@/lib/http';

export async function adminContext() {
  if (!(await requireAdmin())) {
    return { ok: false as const, response: jsonError('Unauthorized', 401) };
  }
  if (!db) {
    return { ok: false as const, response: jsonError('Database is not configured.', 503) };
  }
  return { ok: true as const, db };
}
