import { eq } from 'drizzle-orm';
import { settings } from '@/db/schema';
import { parseProfile } from '@/domain/content';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import { profileInput } from '@/lib/validation';
import { saveProfile } from '@/services/workspace';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  const [row] = await context.db.select().from(settings).where(eq(settings.key, 'profile')).limit(1);
  return jsonOk(parseProfile(row?.value));
}

export async function PATCH(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;
  try {
    const profile = profileInput.parse(await request.json());
    return jsonOk(await saveProfile(profile));
  } catch {
    return jsonError('Invalid site settings.', 400);
  }
}
