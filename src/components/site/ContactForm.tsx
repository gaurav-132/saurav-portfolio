'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) setStatus(result.error || 'Could not send your query.');
      else {
        form.reset();
        setStatus('Thanks — your query has been sent.');
      }
    } catch {
      setStatus('Could not reach the contact inbox. Please try again later.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>Name<input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your name" /></label>
      <label>Email<input name="email" required type="email" maxLength={254} autoComplete="email" placeholder="you@example.com" /></label>
      <label>Mobile number<input name="phone" required type="tel" minLength={7} maxLength={24} pattern="[+()0-9 .-]{7,24}" autoComplete="tel" placeholder="+91 98765 43210" /></label>
      <label className="wide">Query<textarea name="message" required minLength={10} maxLength={4000} placeholder="Tell me a little about your project…" /></label>
      <div className="form-actions wide">
        <button className="pill primary" disabled={sending}>{sending ? 'Sending…' : 'Submit query'} <span>↗</span></button>
        <span aria-live="polite" className="form-note">{status}</span>
      </div>
    </form>
  );
}
