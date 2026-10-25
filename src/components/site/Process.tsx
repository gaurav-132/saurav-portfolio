import type { ProcessStep } from '@/domain/types';

export default function Process({ steps }: { steps: ProcessStep[] }) {
  return (
    <section id="process" className="section wrap">
      <div className="section-head">
        <div>
          <div className="eyebrow">HOW THE WORK MOVES</div>
          <h2>A calm, clear process.</h2>
        </div>
        <p>From first conversation to final master, the edit stays grounded in the story.</p>
      </div>
      <div className="process">
        {steps.map((step, index) => (
          <article className="process-step glass" key={step.title}>
            <div className="mono">{String(index + 1).padStart(2, '0')}</div>
            <b>{step.title}</b>
            <p>{step.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
