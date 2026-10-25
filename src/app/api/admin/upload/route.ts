import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';

const uploadSchema = z.object({
  fileName: z.string().min(1).max(160),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
  size: z.number().positive(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError('Unauthorized', 401);

  try {
    const { fileName, contentType, size } = uploadSchema.parse(await request.json());
    const max = contentType.startsWith('image/') ? 8 * 1024 * 1024 : 250 * 1024 * 1024;
    if (size > max) {
      return jsonError(`Maximum file size is ${contentType.startsWith('image/') ? '8 MB' : '250 MB'}.`, 413);
    }

    const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_BASE_URL'];
    if (required.some((key) => !process.env[key])) {
      return jsonError('Object storage is not configured.', 503);
    }

    const safe = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-').slice(-100);
    const key = `portfolio/${crypto.randomUUID()}-${safe}`;
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );

    return jsonOk({
      url,
      publicUrl: `${process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, '')}/${key}`,
      key,
    });
  } catch {
    return jsonError('Upload could not be prepared.', 400);
  }
}
