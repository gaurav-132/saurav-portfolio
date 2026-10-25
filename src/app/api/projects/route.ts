import { jsonOk } from '@/lib/http';
import { getPublicPortfolio } from '@/services/portfolio';

export async function GET() {
  const portfolio = await getPublicPortfolio();
  return jsonOk(
    { projects: portfolio.projects, categories: portfolio.categories },
    200,
    { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  );
}
