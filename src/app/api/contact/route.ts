import { inquiries } from '@/db/schema';
import { db } from '@/db/client';
import { jsonError, jsonOk } from '@/lib/http';
import { clientKey, hitRateLimit, isRateLimited } from '@/lib/rate-limit';
import { inquiryCreate } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: Request) {
  const key = clientKey(request, 'contact');
  if (isRateLimited(key, 5, 60_000)) {
    return jsonError('Please wait a minute before sending another query.', 429);
  }

  try {
    const inquiry = inquiryCreate.parse(await request.json());
    if (!db) {
      return jsonError('The contact inbox is not configured yet. Please check back soon.', 503);
    }
    await db.insert(inquiries).values(inquiry);
    hitRateLimit(key, 60_000);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof z.ZodError ? 'Please check each field and try again.' : 'Your query could not be saved. Please try again.',
      400,
    );
  }
}
