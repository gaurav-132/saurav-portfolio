'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#work', label: 'My Works' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Process' },
  { href: '#contact', label: 'Contact' },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="wrap nav-inner glass">
        <Link className="brand" href="#home" onClick={() => setOpen(false)}>
          SAURAV <i>GUSAIN</i>
        </Link>
        <div className="nav-links">
          {links.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>
        <a className="pill primary" href="#contact">Let’s work together <span>↗</span></a>
        <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
      <div className={`mobile-nav glass ${open ? 'open' : ''}`}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="pill primary" href="#contact" onClick={() => setOpen(false)}>Let’s work together</a>
      </div>
    </nav>
  );
}
