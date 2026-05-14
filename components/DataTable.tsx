'use client';

import React, { useState, useCallback } from 'react';

interface Entry {
  id: string;
  title: string;
  caption: string;
  overlay: string;
  tags: string;
  notes: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  fileName: string;
  fileSize: number;
  isCleaned: boolean;
}

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
const CheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
);
const DatabaseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

interface DataTableProps {
  entries: Entry[];
  onToast: (msg: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (entry: Entry) => void;
}

export default function DataTable({ entries, onToast, onDelete, onUpdate }: DataTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Entry>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      onToast('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 1200);
    });
  }, [onToast]);

  const download = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const startEdit = (entry: Entry) => {
    setEditId(entry.id);
    setEditData({ title: entry.title, overlay: entry.overlay, caption: entry.caption, tags: entry.tags, notes: entry.notes });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = (entry: Entry) => {
    onUpdate({ ...entry, ...editData } as Entry);
    setEditId(null);
    setEditData({});
  };

  const confirmDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const setField = (key: string, val: any) => setEditData(prev => ({ ...prev, [key]: val }));

  const CopyBtn = ({ text, uid }: { text: string; uid: string }) => (
    <button
      className={`copy-btn ${copiedId === uid ? 'copied' : ''}`}
      onClick={(e) => { e.stopPropagation(); copy(text, uid); }}
      title="Copy"
    >
      {copiedId === uid ? <CheckSmall /> : <CopyIcon />}
    </button>
  );

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <DatabaseIcon />
        <p>No entries yet. Click <strong>+ New</strong> to add one.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Title</th>
            <th>Overlay</th>
            <th>Caption</th>
            <th>Tags</th>
            <th>Notes</th>
            <th style={{ width: '1%' }}></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isEditing = editId === entry.id;

            return (
              <tr key={entry.id} className={isEditing ? 'editing-row' : ''}>
                {/* File */}
                <td>
                  <div className="file-cell">
                    <div className={`file-icon ${entry.mediaType}`}>
                      {entry.mediaType === 'image' ? <ImageIcon /> : <VideoIcon />}
                    </div>
                    <span className="file-name">{entry.fileName}</span>
                    <button
                      className="download-btn"
                      onClick={() => download(entry.mediaUrl, `clean-${entry.fileName}`)}
                      title="Download clean file"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                </td>

                {/* Title */}
                <td>
                  {isEditing ? (
                    <input className="inline-edit" value={editData.title || ''} onChange={e => setField('title', e.target.value)} autoFocus />
                  ) : (
                    <div className="cell-text">
                      <span>{entry.title}</span>
                      <CopyBtn text={entry.title} uid={`${entry.id}-title`} />
                    </div>
                  )}
                </td>

                {/* Overlay */}
                <td>
                  {isEditing ? (
                    <input className="inline-edit" value={editData.overlay || ''} onChange={e => setField('overlay', e.target.value)} />
                  ) : (
                    <div className="cell-text">
                      <span style={{ color: 'var(--text-secondary)' }}>{entry.overlay || '—'}</span>
                      {entry.overlay && <CopyBtn text={entry.overlay} uid={`${entry.id}-overlay`} />}
                    </div>
                  )}
                </td>

                {/* Caption */}
                <td>
                  {isEditing ? (
                    <input className="inline-edit" value={editData.caption || ''} onChange={e => setField('caption', e.target.value)} />
                  ) : (
                    <div className="cell-text">
                      <span style={{ color: 'var(--text-secondary)' }}>{entry.caption}</span>
                      <CopyBtn text={entry.caption} uid={`${entry.id}-caption`} />
                    </div>
                  )}
                </td>

                {/* Tags */}
                <td>
                  {isEditing ? (
                    <input className="inline-edit" value={editData.tags || ''} onChange={e => setField('tags', e.target.value)} />
                  ) : (
                    <div className="cell-text">
                      <div className="tag-list">
                        {entry.tags ? entry.tags.split(',').slice(0, 3).map((t: string, i: number) => (
                          <span key={i} className="tag">{t.trim()}</span>
                        )) : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>—</span>}
                      </div>
                      {entry.tags && <CopyBtn text={entry.tags} uid={`${entry.id}-tags`} />}
                    </div>
                  )}
                </td>

                {/* Notes */}
                <td>
                  {isEditing ? (
                    <input className="inline-edit" value={editData.notes || ''} onChange={e => setField('notes', e.target.value)} />
                  ) : (
                    <div className="cell-text">
                      <span style={{ color: 'var(--text-tertiary)' }}>{entry.notes || '—'}</span>
                      {entry.notes && <CopyBtn text={entry.notes} uid={`${entry.id}-notes`} />}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td>
                  <div className="row-actions">
                    {isEditing ? (
                      <>
                        <button className="row-action-btn save" onClick={() => saveEdit(entry)} title="Save"><SaveIcon /></button>
                        <button className="row-action-btn" onClick={cancelEdit} title="Cancel"><XIcon /></button>
                      </>
                    ) : (
                      <>
                        <button className="row-action-btn" onClick={() => startEdit(entry)} title="Edit"><EditIcon /></button>
                        <button
                          className={`row-action-btn ${deleteConfirm === entry.id ? 'danger-confirm' : ''}`}
                          onClick={() => confirmDelete(entry.id)}
                          title={deleteConfirm === entry.id ? 'Click again to confirm' : 'Delete'}
                        >
                          <TrashIcon />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
