import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mediaFromUrl } from '@/lib/media';
import { getPublishedProject } from '@/services/portfolio';
import ProjectPlayer from '@/components/site/ProjectPlayer';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublishedProject(slug);
  if (!result) notFound();

  const { project, categoryName } = result;
  const sourceUrl = project.playbackSource === 'external' ? project.actualVideoUrl : project.videoUrl;
  const playable = mediaFromUrl(sourceUrl);
  const fallbackUrl = project.playbackSource === 'external'
    ? project.actualVideoUrl || undefined
    : playable.kind === 'embed' ? playable.fallbackUrl : undefined;

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
        {playable.kind !== 'none' || (project.playbackSource === 'external' && Boolean(project.actualVideoUrl)) ? (
          <ProjectPlayer title={project.title} playable={playable} poster={project.thumbnail || undefined} fallbackUrl={fallbackUrl} />
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
