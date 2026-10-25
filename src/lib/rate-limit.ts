type Bucket = { count: number; started: number };

const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const previous = buckets.get(key);
  return Boolean(previous && now - previous.started < windowMs && previous.count >= limit);
}

export function hitRateLimit(key: string, windowMs: number) {
  const now = Date.now();
  const previous = buckets.get(key);
  if (!previous || now - previous.started >= windowMs) {
    buckets.set(key, { count: 1, started: now });
    return;
  }
  buckets.set(key, { count: previous.count + 1, started: previous.started });
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function clientKey(request: Request, scope: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${scope}:${ip}`;
}
