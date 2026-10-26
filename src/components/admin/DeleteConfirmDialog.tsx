'use client';

export default function DeleteConfirmDialog({ label, deleting, onCancel, onConfirm }: { label: string; deleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
      <section className="dialog glass delete-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-copy">
        <header>
          <div><span className="eyebrow">CONFIRM DELETE</span><h2 id="delete-dialog-title">Delete this entry?</h2></div>
          <button type="button" className="dialog-close" aria-label="Close confirmation" disabled={deleting} onClick={onCancel}>×</button>
        </header>
        <p id="delete-dialog-copy">This will permanently delete <strong>{label}</strong>. This action cannot be undone.</p>
        <div className="dialog-actions">
          <button type="button" className="pill" disabled={deleting} onClick={onCancel}>Cancel</button>
          <button type="button" className="pill delete-confirm-action" disabled={deleting} onClick={onConfirm}>
            {deleting ? <><i className="admin-spinner small" aria-hidden="true" /> Deleting…</> : 'Delete entry'}
          </button>
        </div>
      </section>
    </div>
  );
}
