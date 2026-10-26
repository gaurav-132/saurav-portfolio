import { Buffer } from 'node:buffer';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mediaAssets } from '@/db/schema';
import { adminContext } from '@/lib/admin-guard';
import { jsonError, jsonOk } from '@/lib/http';
import {
  createObjectStorageClient,
  deleteMediaIfUnused,
  isPortfolioObjectKey,
  mediaUrlForKey,
  uploadBucket,
} from '@/lib/object-storage';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'] as const;
const fileMetadata = z.object({
  fileName: z.string().trim().min(1).max(160),
  contentType: z.enum(allowedTypes),
  size: z.number().int().positive(),
});
const prepareSchema = z.object({ action: z.literal('prepare') }).merge(fileMetadata);
const completeSchema = z.object({
  action: z.literal('complete'),
  objectKey: z.string().min(1).max(500),
}).merge(fileMetadata);
const bodySchema = z.discriminatedUnion('action', [prepareSchema, completeSchema]);
const deleteSchema = z.object({ objectKey: z.string().min(1).max(500) });

function maxFileSize(contentType: (typeof allowedTypes)[number]) {
  return contentType.startsWith('image/') ? 8 * 1024 * 1024 : 250 * 1024 * 1024;
}

function fileNameForKey(fileName: string) {
  const safe = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-').slice(-100);
  return `portfolio/${crypto.randomUUID()}-${safe}`;
}

async function hasExpectedFileSignature(s3: ReturnType<typeof createObjectStorageClient>, objectKey: string, contentType: (typeof allowedTypes)[number]) {
  const response = await s3.send(new GetObjectCommand({
    Bucket: uploadBucket(),
    Key: objectKey,
    Range: 'bytes=0-15',
  }));
  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) return false;

  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') return Buffer.from(bytes.subarray(0, 8)).toString('latin1') === '\x89PNG\r\n\x1a\n';
  if (contentType === 'image/webp') return Buffer.from(bytes.subarray(0, 4)).toString('ascii') === 'RIFF' && Buffer.from(bytes.subarray(8, 12)).toString('ascii') === 'WEBP';
  if (contentType === 'video/mp4') return Buffer.from(bytes.subarray(4, 8)).toString('ascii') === 'ftyp';
  return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return jsonError('Choose a supported image or MP4/WebM video file.', 400);
  }

  if (body.size > maxFileSize(body.contentType)) {
    return jsonError(`Maximum file size is ${body.contentType.startsWith('image/') ? '8 MB' : '250 MB'}.`, 413);
  }

  try {
    const s3 = createObjectStorageClient();
    if (body.action === 'prepare') {
      const objectKey = fileNameForKey(body.fileName);
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: uploadBucket(),
          Key: objectKey,
          ContentType: body.contentType,
        }),
        { expiresIn: 300 },
      );
      return jsonOk({ url, objectKey, mediaUrl: mediaUrlForKey(objectKey) });
    }

    if (!isPortfolioObjectKey(body.objectKey)) return jsonError('Invalid upload key.', 400);
    const [existing] = await context.db
      .select({ objectKey: mediaAssets.objectKey })
      .from(mediaAssets)
      .where(eq(mediaAssets.objectKey, body.objectKey))
      .limit(1);

    const object = await s3.send(new HeadObjectCommand({ Bucket: uploadBucket(), Key: body.objectKey }));
    if (!object.ContentLength || object.ContentLength > maxFileSize(body.contentType)) {
      await s3.send(new DeleteObjectCommand({ Bucket: uploadBucket(), Key: body.objectKey }));
      return jsonError('The uploaded file is empty or exceeds the allowed size.', 413);
    }
    if (object.ContentLength !== body.size || object.ContentType !== body.contentType) {
      await s3.send(new DeleteObjectCommand({ Bucket: uploadBucket(), Key: body.objectKey }));
      return jsonError('The uploaded file metadata does not match the selected file.', 400);
    }
    if (!(await hasExpectedFileSignature(s3, body.objectKey, body.contentType))) {
      await s3.send(new DeleteObjectCommand({ Bucket: uploadBucket(), Key: body.objectKey }));
      return jsonError('The file contents do not match the selected image or video type.', 415);
    }

    if (!existing) {
      await context.db.insert(mediaAssets).values({
        objectKey: body.objectKey,
        originalFileName: body.fileName,
        contentType: body.contentType,
        fileSize: object.ContentLength,
      });
    }
    return jsonOk({ mediaUrl: mediaUrlForKey(body.objectKey), objectKey: body.objectKey });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not configured')) {
      return jsonError(error.message, 503);
    }
    return jsonError('Neon storage could not prepare or verify this upload. Check the storage credentials and bucket.', 502);
  }
}

export async function GET(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;

  const objectKey = new URL(request.url).searchParams.get('objectKey');
  if (!objectKey || !isPortfolioObjectKey(objectKey)) {
    return jsonError('Invalid upload key.', 400);
  }

  try {
    const [asset] = await context.db
      .select({ objectKey: mediaAssets.objectKey })
      .from(mediaAssets)
      .where(eq(mediaAssets.objectKey, objectKey))
      .limit(1);
    if (!asset) return jsonError('File not found.', 404);

    const url = await getSignedUrl(
      createObjectStorageClient(),
      new GetObjectCommand({ Bucket: uploadBucket(), Key: objectKey }),
      { expiresIn: 300 },
    );
    return NextResponse.redirect(url, { status: 307, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not configured')) {
      return jsonError(error.message, 503);
    }
    return jsonError('The uploaded file could not be opened.', 502);
  }
}

export async function DELETE(request: Request) {
  const context = await adminContext();
  if (!context.ok) return context.response;

  try {
    const { objectKey } = deleteSchema.parse(await request.json());
    if (!isPortfolioObjectKey(objectKey)) return jsonError('Invalid upload key.', 400);
    await deleteMediaIfUnused(context.db, objectKey);
    return jsonOk({ ok: true });
  } catch {
    return jsonError('The file could not be removed from Neon Object Storage.', 502);
  }
}
