import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { projects, categories } from '@/lib/schema';
import { demoProjects } from '@/lib/demo-projects';

function media(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return { kind: 'none' as const };
    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com')) {
      const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.pathname === '/watch' ? parsed.searchParams.get('v') : parsed.pathname.split('/').filter(Boolean).at(-1);
      return id && /^[\w-]{6,20}$/.test(id) ? { kind: 'embed' as const, src: `https://www.youtube-nocookie.com/embed/${id}` } : { kind: 'none' as const };
    }
    if (parsed.hostname === 'vimeo.com' || parsed.hostname.endsWith('.vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? { kind: 'embed' as const, src: `https://player.vimeo.com/video/${id}` } : { kind: 'none' as const };
    }
    return { kind: 'video' as const, src: parsed.toString() };
  } catch { return { kind: 'none' as const }; }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stored = db ? await db.select().from(projects).where(and(eq(projects.slug, slug), eq(projects.published, true))).limit(1) : [];
  const project = stored[0] ?? demoProjects.find((item) => item.slug === slug);
  if (!project) notFound();
  let category = 'PROJECT';
  if (project.categoryId && db) { const [item] = await db.select().from(categories).where(eq(categories.id, project.categoryId)); if (item) category = item.name; }
  const playable = media(project.videoUrl);
  return <main style={{ minHeight: '100vh', padding: '35px 5vw' }}><Link href="/" className="brand">SAURAV <i style={{ color: 'var(--lime)' }}>GUSAIN</i></Link><article style={{ maxWidth: 980, margin: '100px auto' }}><div className="eyebrow">{category} / SELECTED WORK</div><h1 style={{ fontSize: 'clamp(42px,8vw,90px)', lineHeight: 1, letterSpacing: '-.07em' }}>{project.title}</h1><p style={{ color: '#aeb2ac', maxWidth: 650, lineHeight: 1.8 }}>{project.description}</p>{playable.kind === 'video' ? <video controls playsInline preload="metadata" poster={project.thumbnail || undefined} style={{ width: '100%', marginTop: 36, borderRadius: 7, background: '#111' }} src={playable.src} /> : playable.kind === 'embed' ? <iframe title={`${project.title} video`} src={playable.src} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ width: '100%', aspectRatio: '16 / 9', marginTop: 36, border: 0, borderRadius: 7, background: '#111' }} /> : project.thumbnail ? <Image src={project.thumbnail} unoptimized width={1920} height={1080} alt={`${project.title} project cover`} style={{ width: '100%', height: 'auto', marginTop: 36, borderRadius: 7 }} /> : <div className="glass" style={{ height: 400, marginTop: 36, borderRadius: 7 }} />}<p style={{ marginTop: 50 }}><Link className="pill" href="/#work">← Back to selected work</Link></p></article></main>;
}
