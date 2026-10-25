import { getSession } from '@/lib/auth';
import { jsonOk } from '@/lib/http';

export async function POST() {
  const session = await getSession();
  session.destroy();
  return jsonOk({ ok: true });
}
