import type { Offering } from '@/domain/types';

export default function Services({ offerings }: { offerings: Offering[] }) {
  return (
    <section id="services" className="section wrap">
      <div className="section-head">
        <div>
          <div className="eyebrow">HOW I CAN HELP</div>
          <h2>Made for the medium.</h2>
        </div>
        <p>Flexible editing support from first assembly to final delivery.</p>
      </div>
      <div className="services">
        {offerings.map((offering, index) => (
          <div className="service glass" key={offering.id}>
            <div className="mono">{String(index + 1).padStart(2, '0')} — EDITING</div>
            <b>{offering.title}</b>
            <p>{offering.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
