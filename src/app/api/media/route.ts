import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { mediaAssets, projects } from '@/db/schema';
import { createObjectStorageClient, isPortfolioObjectKey, objectKeyFromMediaUrl, uploadBucket } from '@/lib/object-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!key || !isPortfolioObjectKey(key)) {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!db) {
    return NextResponse.json({ error: 'Object storage is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const [asset] = await db
      .select({ objectKey: mediaAssets.objectKey })
      .from(mediaAssets)
      .where(eq(mediaAssets.objectKey, key))
      .limit(1);
    if (!asset) {
      return NextResponse.json({ error: 'Media not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    const projectRows = await db.select().from(projects).where(eq(projects.published, true));
    const usedByPublishedProject = projectRows.some((project) =>
      [project.videoUrl, project.thumbnail].some((value) => objectKeyFromMediaUrl(value) === key),
    );
    if (!usedByPublishedProject) {
      return NextResponse.json({ error: 'Media not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    const s3 = createObjectStorageClient();
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: uploadBucket(), Key: key }),
      { expiresIn: 3600 },
    );
    return NextResponse.redirect(url, { status: 307, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json({ error: error.message }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ error: 'Media could not be loaded.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
