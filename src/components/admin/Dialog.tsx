'use client';

import type { ReactNode } from 'react';

export default function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dialog glass" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header>
          <div>
            <span className="eyebrow">PORTFOLIO CRM</span>
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button className="dialog-close" aria-label="Close dialog" onClick={onClose}>×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
