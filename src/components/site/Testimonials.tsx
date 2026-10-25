import type { Testimonial } from '@/domain/types';

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section id="kind-words" className="section wrap">
      <div className="section-head">
        <div>
          <div className="eyebrow">KIND WORDS</div>
          <h2>What collaborators notice.</h2>
        </div>
        <p>A few notes from people I’ve cut with. Replace these with your own when you’re ready.</p>
      </div>
      <div className="quotes">
        {items.map((item) => (
          <blockquote className="quote glass" key={item.id}>
            <div className="mono">TESTIMONIAL</div>
            <p>“{item.quote}”</p>
            <b>{item.author}</b>
            <small>{item.role}</small>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
