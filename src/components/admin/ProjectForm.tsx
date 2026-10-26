'use client';

import type { FormEvent } from 'react';
import type { Category } from '@/domain/types';
import RequiredMark from '@/components/RequiredMark';

export type ProjectFormState = {
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  actualVideoUrl: string;
  playbackSource: 'uploaded' | 'external';
  categoryId: string | null;
  clientName: string;
  year: string;
  duration: string;
  role: string;
  published: boolean;
  featured: boolean;
};

type Props = {
  value: ProjectFormState;
  categories: Category[];
  editing: boolean;
  preview: boolean;
  saving: boolean;
  uploadingField: 'thumbnail' | 'videoUrl' | null;
  error: string;
  currentYear: number;
  onChange: (value: ProjectFormState) => void;
  onUpload: (file: File, field: 'thumbnail' | 'videoUrl') => void;
  onRemove: (field: 'thumbnail' | 'videoUrl') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  uploadViewHref: (value: string) => string;
};

function UploadProgress() {
  return <span className="file-upload-progress" role="status" aria-live="polite"><i className="file-upload-spinner" aria-hidden="true" /><span className="sr-only">Uploading file</span></span>;
}

export default function ProjectForm({ value, categories, editing, preview, saving, uploadingField, error, currentYear, onChange, onUpload, onRemove, onSubmit, onCancel, uploadViewHref }: Props) {
    const set = <K extends keyof ProjectFormState>(key: K, next: ProjectFormState[K]) => onChange({ ...value, [key]: next });
    const busy = Boolean(uploadingField);

    return (
        <form className="dialog-form project-form" onSubmit={onSubmit}>
            <label>Project name <RequiredMark /><input required minLength={1} maxLength={160} value={value.title} onChange={(event) => set('title', event.target.value)} /></label>
            <label>Description <RequiredMark /><textarea required minLength={1} maxLength={5000} rows={4} value={value.description} onChange={(event) => set('description', event.target.value)} /></label>
            <div className="dialog-grid">
            <label>Category
                <select value={value.categoryId || ''} onChange={(event) => set('categoryId', event.target.value || null)}>
                <option value="">Uncategorized</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
            </label>
            <label>Client<input maxLength={120} value={value.clientName} onChange={(event) => set('clientName', event.target.value)} /></label>
            <label>Year <RequiredMark /><input type="number" inputMode="numeric" required min={1900} max={currentYear + 1} step={1} value={value.year} onChange={(event) => set('year', event.target.value)} placeholder={String(currentYear)} /></label>
            <label>Duration<input maxLength={24} value={value.duration} onChange={(event) => set('duration', event.target.value)} /></label>
            </div>
            <label>Role<input maxLength={80} value={value.role} onChange={(event) => set('role', event.target.value)} /></label>
            <label className="file-field">Thumbnail image <RequiredMark />
            {uploadingField === 'thumbnail' ? <UploadProgress /> : value.thumbnail ? <>
                {/* <input type="text" value={value.thumbnail} readOnly aria-readonly="true" /> */}
                <div className="file-actions" style={{ marginTop: '6px' }}>
                    <a className="pill" href={uploadViewHref(value.thumbnail)} target="_blank" rel="noreferrer">View</a>
                    <button type="button" className="pill file-remove" disabled={busy || saving} onClick={() => onRemove('thumbnail')}>Remove</button>
                </div>
            </> : <input type="file" accept="image/jpeg,image/png,image/webp" required disabled={Boolean(uploadingField) || saving} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file, 'thumbnail'); event.currentTarget.value = ''; }} />}
            </label>
            <label className="file-field">Card preview video <RequiredMark />
            {uploadingField === 'videoUrl' ? <UploadProgress /> : value.videoUrl ? <>
                {/* <input type="text" value={value.videoUrl} readOnly aria-readonly="true" /> */}
                <div className="file-actions" style={{ marginTop: '6px' }}>
                    <a className="pill" href={uploadViewHref(value.videoUrl)} target="_blank" rel="noreferrer">View</a>
                    <button type="button" className="pill file-remove" disabled={busy || saving} onClick={() => onRemove('videoUrl')}>Remove</button>
                </div>
            </> : <input type="file" accept="video/mp4,video/webm" required disabled={Boolean(uploadingField) || saving} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file, 'videoUrl'); event.currentTarget.value = ''; }} />}
            </label>
            <label>Playback source <RequiredMark />
            <select required value={value.playbackSource} onChange={(event) => {
                const playbackSource = event.target.value as ProjectFormState['playbackSource'];
                onChange({ ...value, playbackSource, ...(playbackSource === 'uploaded' ? { actualVideoUrl: '' } : {}) });
            }}>
                <option value="uploaded">Play the uploaded video</option>
                <option value="external">Play from an external link</option>
            </select>
            </label>
            {value.playbackSource === 'external' && <label>External video link <RequiredMark /><input type="url" required maxLength={2048} pattern="https?://.+" value={value.actualVideoUrl} onChange={(event) => set('actualVideoUrl', event.target.value)} placeholder="Paste a video URL from any supported source" /></label>}
            <p className="form-hint">The uploaded video is used for the work card preview. Choose whether the project page plays this upload or the required external link.</p>
            <div className="dialog-checks">
            <label><input type="checkbox" checked={value.published} onChange={(event) => set('published', event.target.checked)} />Publish work</label>
            <label><input type="checkbox" checked={value.featured} onChange={(event) => set('featured', event.target.checked)} />Feature on homepage</label>
            </div>
            {error && <div className="error" role="alert">{error}</div>}
            <div className="dialog-actions">
            <button type="button" className="pill" onClick={onCancel}>Cancel</button>
            <button type="submit" className="pill primary" disabled={preview || busy || saving}>{preview ? 'Preview only' : saving ? 'Saving…' : editing ? 'Save changes' : 'Create work'}</button>
            </div>
        </form>
    );
}
