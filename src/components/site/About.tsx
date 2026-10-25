import type { SiteProfile } from '@/domain/types';

export default function About({ profile }: { profile: SiteProfile }) {
  return (
    <section id="about" className="section wrap">
      <div className="about-grid">
        <div className="portrait glass">
          <span className="mono" style={{ position: 'absolute', top: 18, left: 18 }}>A LITTLE ABOUT ME</span>
        </div>
        <div className="about-copy">
          <div className="eyebrow">{profile.aboutEyebrow}</div>
          <h2>{profile.aboutTitle}</h2>
          {profile.aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="chips">
            {profile.tools.map((tool) => <span key={tool} className="chip">{tool}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
