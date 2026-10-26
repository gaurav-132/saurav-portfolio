import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { mediaAssets, projects } from '@/db/schema';
import type { db as database } from '@/db/client';

export const uploadBucket = () => process.env.AWS_S3_BUCKET || 'uploads';

export function createObjectStorageClient() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!endpoint || !accessKeyId || !secretAccessKey || !region) {
    throw new Error('Neon Object Storage is not configured. Set all four AWS_* storage variables.');
  }

  let parsedEndpoint: URL;
  try {
    parsedEndpoint = new URL(endpoint);
  } catch {
    throw new Error('AWS_ENDPOINT_URL_S3 must be a valid HTTPS endpoint.');
  }
  if (parsedEndpoint.protocol !== 'https:') {
    throw new Error('AWS_ENDPOINT_URL_S3 must use HTTPS.');
  }

  return new S3Client({
    region,
    endpoint: parsedEndpoint.origin,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: 'WHEN_REQUIRED',
  });
}

export function isPortfolioObjectKey(key: string) {
  return key.startsWith('portfolio/') && !key.includes('..') && !key.startsWith('/') && !key.includes('\\');
}

export function mediaUrlForKey(key: string) {
  return `/api/media?key=${encodeURIComponent(key)}`;
}

export function objectKeyFromMediaUrl(value: string) {
  try {
    const parsed = new URL(value, 'https://portfolio.invalid');
    if (parsed.pathname !== '/api/media') return null;
    const key = parsed.searchParams.get('key');
    return key && isPortfolioObjectKey(key) ? key : null;
  } catch {
    return null;
  }
}

type Database = NonNullable<typeof database>;

export async function deleteMediaIfUnused(db: Database, key: string) {
  if (!isPortfolioObjectKey(key)) return;
  const refs = await db.select({ videoUrl: projects.videoUrl, thumbnail: projects.thumbnail }).from(projects);
  if (refs.some((project) => [project.videoUrl, project.thumbnail].some((value) => objectKeyFromMediaUrl(value) === key))) return;

  await createObjectStorageClient().send(
    new DeleteObjectCommand({ Bucket: uploadBucket(), Key: key }),
  );
  await db.delete(mediaAssets).where(eq(mediaAssets.objectKey, key));
}
