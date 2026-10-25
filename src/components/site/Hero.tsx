import type { Project, SiteProfile } from '@/domain/types';
import { safeBackgroundImage } from '@/lib/media';

export default function Hero({ profile, featured }: { profile: SiteProfile; featured: Project[] }) {
  const still = featured[0];
  const background = still?.thumbnail
    ? `linear-gradient(180deg,#07080788,transparent 40%), url("${safeBackgroundImage(still.thumbnail)}")`
    : undefined;

  return (
    <section id="home" className="hero wrap">
      <div>
        <div className="hero-kicker">
          <span className="eyebrow">{profile.heroEyebrow}</span>
          <span className="eyebrow hero-name">· {profile.displayName}</span>
        </div>
        <h1>
          {profile.heroHeadline} <span className="accent">{profile.heroHighlight}</span>
        </h1>
        <p className="hero-copy">{profile.heroCopy}</p>
        <div className="hero-ctas">
          <a className="pill primary" href="#work">Explore my work <span>↓</span></a>
          <a className="pill" href="#contact">Let’s collaborate <span>↗</span></a>
        </div>
        <div className="hero-stats">
          <div><b>{String(Math.max(featured.length, 1)).padStart(2, '0')}</b><span>Featured cuts</span></div>
          <div><b>{String(profile.process.length).padStart(2, '0')}</b><span>Process steps</span></div>
          <div><b>{profile.location || 'Worldwide'}</b><span>Based in</span></div>
        </div>
      </div>
      <div className="hero-stage" aria-hidden={!still}>
        <span className="hero-chip">FRAME 01 / STORY IN MOTION</span>
        <div className="hero-frame" style={background ? { backgroundImage: background } : undefined} />
        <div className="hero-frame-meta">
          <span className="mono">{still?.title ?? 'Selected work'}</span>
          <span>{still?.year || profile.roleTitle}</span>
        </div>
        <span className="hero-play">▶</span>
      </div>
      <div className="scroll-note">SCROLL TO EXPLORE ↓</div>
    </section>
  );
}
