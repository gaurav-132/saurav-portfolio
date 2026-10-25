import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mediaFromUrl } from '@/lib/media';
import { getPublishedProject } from '@/services/portfolio';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublishedProject(slug);
  if (!result) notFound();

  const { project, categoryName } = result;
  const playable = mediaFromUrl(project.videoUrl);

  return (
    <main className="project-page wrap">
      <Link href="/" className="brand">SAURAV <i>GUSAIN</i></Link>
      <article>
        <div className="eyebrow">{categoryName} / SELECTED WORK</div>
        <h1>{project.title}</h1>
        <p className="lede">{project.description}</p>
        <div className="project-facts">
          {project.clientName && <span>Client · {project.clientName}</span>}
          {project.year && <span>Year · {project.year}</span>}
          {project.duration && <span>Duration · {project.duration}</span>}
          {project.role && <span>Role · {project.role}</span>}
        </div>
        {playable.kind === 'video' ? (
          <video className="project-media" controls playsInline preload="metadata" poster={project.thumbnail || undefined} src={playable.src} />
        ) : playable.kind === 'embed' ? (
          <iframe className="project-media embed" title={`${project.title} video`} src={playable.src} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        ) : project.thumbnail ? (
          <Image className="project-media" src={project.thumbnail} unoptimized width={1920} height={1080} alt={`${project.title} project cover`} />
        ) : (
          <div className="glass project-media" style={{ height: 400 }} />
        )}
        <p style={{ marginTop: 50 }}>
          <Link className="pill" href="/#work">← Back to selected work</Link>
        </p>
      </article>
    </main>
  );
}
