'use client';

import type { FormEvent } from 'react';
import type { LeadStatus, SiteProfile } from '@/domain/types';
import { leadStatuses } from '@/domain/types';
import { leadStatusCopy } from '@/domain/content';
import RequiredMark from '@/components/RequiredMark';

type FormFrameProps = { error: string; preview: boolean; onCancel: () => void };
type LeadFormValue = { name: string; email: string; phone: string; message: string; status: LeadStatus; notes: string; isRead: boolean };
type TestimonialFormValue = { quote: string; author: string; role: string; published: boolean };
type OfferingFormValue = { title: string; description: string; published: boolean };

export function CategoryForm({ value, onChange, onSubmit, error, preview, onCancel }: FormFrameProps & { value: { name: string }; onChange: (value: { name: string }) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="dialog-form" onSubmit={onSubmit}>
    <label>Category name <RequiredMark /><input required minLength={1} maxLength={80} value={value.name} onChange={(event) => onChange({ name: event.target.value })} /></label>
    <p className="form-hint">A clean URL slug is created from the name automatically.</p>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="dialog-actions"><button type="button" className="pill" onClick={onCancel}>Cancel</button><button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save category'}</button></div>
  </form>;
}

export function LeadForm({ value, onChange, onSubmit, error, preview, onCancel }: FormFrameProps & { value: LeadFormValue; onChange: (value: LeadFormValue) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => onChange({ ...value, [key]: next });
  return <form className="dialog-form" onSubmit={onSubmit}>
    <div className="dialog-grid">
      <label>Name <RequiredMark /><input required minLength={2} maxLength={120} value={value.name} onChange={(event) => set('name', event.target.value)} /></label>
      <label>Email <RequiredMark /><input required type="email" maxLength={254} value={value.email} onChange={(event) => set('email', event.target.value)} /></label>
    </div>
    <label>Mobile <RequiredMark /><input required type="tel" minLength={7} maxLength={24} pattern="[+()0-9 .-]{7,24}" value={value.phone} onChange={(event) => set('phone', event.target.value)} /></label>
    <label>Stage <RequiredMark /><select required value={value.status} onChange={(event) => set('status', event.target.value as LeadStatus)}>{leadStatuses.map((status) => <option key={status} value={status}>{leadStatusCopy[status]}</option>)}</select></label>
    <label>Query <RequiredMark /><textarea required minLength={10} maxLength={4000} rows={5} value={value.message} onChange={(event) => set('message', event.target.value)} /></label>
    <label>Internal notes<textarea maxLength={4000} rows={3} value={value.notes} onChange={(event) => set('notes', event.target.value)} /></label>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="dialog-actions"><button type="button" className="pill" onClick={onCancel}>Cancel</button><button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save lead'}</button></div>
  </form>;
}

export function TestimonialForm({ value, onChange, onSubmit, error, preview, onCancel }: FormFrameProps & { value: TestimonialFormValue; onChange: (value: TestimonialFormValue) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => onChange({ ...value, [key]: next });
  return <form className="dialog-form" onSubmit={onSubmit}>
    <label>Quote <RequiredMark /><textarea required minLength={8} maxLength={600} value={value.quote} onChange={(event) => set('quote', event.target.value)} /></label>
    <div className="dialog-grid"><label>Author <RequiredMark /><input required minLength={1} maxLength={80} value={value.author} onChange={(event) => set('author', event.target.value)} /></label><label>Role<input maxLength={120} value={value.role} onChange={(event) => set('role', event.target.value)} /></label></div>
    <div className="dialog-checks"><label><input type="checkbox" checked={value.published} onChange={(event) => set('published', event.target.checked)} />Publish</label></div>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="dialog-actions"><button type="button" className="pill" onClick={onCancel}>Cancel</button><button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save quote'}</button></div>
  </form>;
}

export function OfferingForm({ value, onChange, onSubmit, error, preview, onCancel }: FormFrameProps & { value: OfferingFormValue; onChange: (value: OfferingFormValue) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
    const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => onChange({ ...value, [key]: next });
    return (
        <form className="dialog-form" onSubmit={onSubmit}>
            <div>
                <label>Title <RequiredMark /></label>
                <input required minLength={1} maxLength={80} value={value.title} onChange={(event) => set('title', event.target.value)} />
            </div>
            <div>
                <label>Description</label>
                <textarea maxLength={400} value={value.description} onChange={(event) => set('description', event.target.value)} />
            </div>
            <div>
                <div className="dialog-checks">
                    <label>Publish</label>
                    <input type="checkbox" checked={value.published} onChange={(event) => set('published', event.target.checked)} />                
                </div>
                {error && <div className="error" role="alert">{error}</div>}
            </div>
            <div>
                <div className="dialog-actions">
                    <button type="button" className="pill" onClick={onCancel}>Cancel</button>
                    <button className="pill primary" disabled={preview}>
                        {preview ? 'Preview only' : 'Save service'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export function SettingsForm({ value, onChange, onSubmit, preview, saving }: { value: SiteProfile; onChange: (value: SiteProfile) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; preview: boolean; saving: boolean }) {
  return <form className="glass admin-box settings-form" onSubmit={onSubmit}>
    <div className="dialog-grid">
      <label className="field">Display name <RequiredMark /><input required minLength={1} maxLength={80} value={value.displayName} onChange={(event) => onChange({ ...value, displayName: event.target.value })} /></label>
      <label className="field">Role title<input maxLength={80} value={value.roleTitle} onChange={(event) => onChange({ ...value, roleTitle: event.target.value })} /></label>
      <label className="field">Location<input maxLength={80} value={value.location} onChange={(event) => onChange({ ...value, location: event.target.value })} /></label>
      <label className="field">Public email<input type="email" maxLength={254} value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} /></label>
    </div>
    <label className="field">Hero headline <RequiredMark /><input required minLength={1} maxLength={160} value={value.heroHeadline} onChange={(event) => onChange({ ...value, heroHeadline: event.target.value })} /></label>
    <label className="field">Hero highlight<input maxLength={80} value={value.heroHighlight} onChange={(event) => onChange({ ...value, heroHighlight: event.target.value })} /></label>
    <label className="field">Hero copy<textarea maxLength={600} value={value.heroCopy} onChange={(event) => onChange({ ...value, heroCopy: event.target.value })} /></label>
    <label className="field">About title<input maxLength={160} value={value.aboutTitle} onChange={(event) => onChange({ ...value, aboutTitle: event.target.value })} /></label>
    <label className="field">About copy<textarea value={value.aboutParagraphs.join('\n\n')} onChange={(event) => onChange({ ...value, aboutParagraphs: event.target.value.split(/\n\n+/) })} /></label>
    <label className="field">Tools (comma separated)<input value={value.tools.join(', ')} onChange={(event) => onChange({ ...value, tools: event.target.value.split(',').map((item) => item.trim()) })} /></label>
    <label className="field">Contact title<input maxLength={120} value={value.contactTitle} onChange={(event) => onChange({ ...value, contactTitle: event.target.value })} /></label>
    <div className="dialog-actions"><button className="pill primary" disabled={preview || saving}>{preview ? 'Preview only' : saving ? 'Saving…' : 'Save settings'}</button></div>
  </form>;
}
