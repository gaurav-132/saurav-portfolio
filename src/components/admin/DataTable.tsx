'use client';

import { useState, type ReactNode } from 'react';

export type Column<T> = { key: string; title: string; render: (row: T) => ReactNode };

export default function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  onEdit,
  onDelete,
  actions = true,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: boolean;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const showActions = actions && Boolean(onEdit || onDelete);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="table-card glass">
      <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.title}</th>)}
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
                {showActions && (
                  <td>
                    <div className="row-actions">
                      {onEdit && <button className="table-action" onClick={() => onEdit(row)}>Edit</button>}
                      {onDelete && <button className="table-action delete-action" onClick={() => onDelete(row)}>Delete</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="table-empty">{empty}</div>}
      </div>
      <div className="table-footer">
        <span>{rows.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, rows.length)} of ${rows.length}` : '0 records'}</span>
        <div className="pagination">
          <button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((current) => current - 1)}>←</button>
          <span>Page {currentPage} of {pageCount}</span>
          <button aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => current + 1)}>→</button>
        </div>
      </div>
    </div>
  );
}
