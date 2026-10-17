'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type GalleryItem = { id: string; slug: string; title: string; thumbnail: string; categoryId: string | null; featured: boolean };
export default function WorkGallery({ items, categories }: { items: GalleryItem[]; categories: { id: string; name: string }[] }) {
  const [active, setActive] = useState('all');
  const visible = useMemo(() => items.filter((item) => active === 'all' || item.categoryId === active), [items, active]);
  return <div className="work-library"><div className="filters" aria-label="Filter projects"><button className={`filter ${active === 'all' ? 'active' : ''}`} onClick={() => setActive('all')}>All work</button>{categories.map((category) => <button key={category.id} className={`filter ${active === category.id ? 'active' : ''}`} onClick={() => setActive(category.id)}>{category.name}</button>)}</div><div className="gallery">{visible.map((item, index) => <Link href={`/projects/${item.slug}`} key={item.id} className="project-card"><div className={`project-image g${index % 3}`} style={{ backgroundImage: `linear-gradient(0deg,#07080766,transparent),url("${item.thumbnail.replaceAll('"', '%22')}")`, backgroundPosition: 'center', backgroundSize: 'cover' }}><span className="mono" style={{ position: 'absolute', top: 16, left: 16, color: '#e7f0de' }}>SG / FILM</span>{item.slug.startsWith('demo-') && <span className="demo-ribbon">DEMO · SAMPLE FOOTAGE</span>}</div><div className="project-meta"><div><h3>{item.title}</h3><p>{categories.find((category) => category.id === item.categoryId)?.name ?? (item.slug.startsWith('demo-') ? 'DEMO CUT' : 'PROJECT')}</p></div></div></Link>)}</div>{visible.length === 0 && <p className="empty-filter">No projects in this category yet.</p>}</div>;
}
