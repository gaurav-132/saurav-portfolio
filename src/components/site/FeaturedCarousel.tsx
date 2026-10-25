'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category, Project } from '@/domain/types';
import { safeBackgroundImage } from '@/lib/media';

export default function FeaturedCarousel({ items, categories }: { items: Project[]; categories: Category[] }) {
  const [active, setActive] = useState(0);
  if (!items.length) {
    return (
      <div className="project-empty glass">
        <span className="mono">YOUR FIRST FRAME GOES HERE</span>
        <p>Published projects will appear here.</p>
      </div>
    );
  }

  const selected = items[active] || items[0];
  const move = (step: number) => setActive((index) => (index + step + items.length) % items.length);
  const category = categories.find((item) => item.id === selected.categoryId)?.name || 'Selected work';
  const thumbnail = selected.slug.startsWith('demo-') ? `${selected.thumbnail}?v=2` : selected.thumbnail;

  return (
    <div className="featured-carousel" aria-roledescription="carousel" aria-label="Featured video work">
      <div className="featured-slide">
        <Link
          href={`/projects/${selected.slug}`}
          className="featured-visual"
          aria-label={`View ${selected.title}`}
          style={{ backgroundImage: `linear-gradient(145deg,#11171018,#080a0940),url("${safeBackgroundImage(thumbnail)}")` }}
        >
          <span className="featured-index mono">
            FEATURED · {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          {selected.slug.startsWith('demo-') && <span className="demo-ribbon">DEMO · SAMPLE FOOTAGE</span>}
          <span className="visual-play" aria-hidden="true">↗</span>
        </Link>
        <div className="featured-copy">
          <div className="featured-overline">
            <span className="eyebrow">{category}</span>
            <span className="featured-year">{selected.year || 'SELECTED PROJECT'}</span>
          </div>
          <h3>{selected.title}</h3>
          <p className="featured-description">{selected.description || 'A story shaped through careful pacing, sound, and detail.'}</p>
          <Link href={`/projects/${selected.slug}`} className="featured-cta">Explore this project <span>↗</span></Link>
          <div className="featured-bottom">
            <span>{selected.role || 'EDITED WITH INTENTION'}</span>
            <div className="carousel-dots" role="group" aria-label="Choose featured project">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  className={index === active ? 'active' : ''}
                  aria-label={`Show ${item.title}`}
                  aria-current={index === active ? 'true' : undefined}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="carousel-controls">
        <span className="carousel-count">{String(active + 1).padStart(2, '0')} <i>/</i> {String(items.length).padStart(2, '0')}</span>
        <span className="carousel-hint">Use arrows to explore more work</span>
        <div className="carousel-arrows">
          <button aria-label="Previous project" onClick={() => move(-1)}>←</button>
          <button aria-label="Next project" onClick={() => move(1)}>→</button>
        </div>
      </div>
    </div>
  );
}
