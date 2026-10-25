import { jsonOk } from '@/lib/http';
import { adminContext } from '@/lib/admin-guard';
import { getAdminWorkspace } from '@/services/workspace';

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return context.response;
  return jsonOk(await getAdminWorkspace());
}
