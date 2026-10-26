import Link from 'next/link';

export default function ProjectLoading() {
  return (
    <main className="project-page project-loading wrap" aria-busy="true" aria-live="polite">
      <Link href="/" className="brand">SAURAV <i>GUSAIN</i></Link>
      <article>
        <span className="project-loading-line short" />
        <span className="project-loading-line title" />
        <span className="project-loading-line description" />
        <span className="project-loading-line description second" />
        <div className="project-loading-facts"><span /><span /><span /></div>
        <div className="project-loading-media glass"><i className="project-loading-spinner" aria-hidden="true" /><span>Loading project</span></div>
      </article>
    </main>
  );
}
