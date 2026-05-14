'use client';

import React, { useState, useCallback } from 'react';

interface Entry {
  id: string;
  title: string;
  caption: string;
  tags: string;
  notes: string;
  sourceInfo: string;
  status: boolean;
  date: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  fileName: string;
  fileSize: number;
  isCleaned: boolean;
}

// Inline SVG icons
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

interface DataTableProps {
  entries: Entry[];
  onToast: (msg: string) => void;
}

export default function DataTable({ entries, onToast }: DataTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
            <th>Caption</th>
            <th>Tags</th>
            <th>Source</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              {/* File cell: icon + name + download */}
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
                <div className="cell-text">
                  <span>{entry.title}</span>
                  <CopyBtn text={entry.title} uid={`${entry.id}-title`} />
                </div>
              </td>

              {/* Caption */}
              <td>
                <div className="cell-text">
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.caption}</span>
                  <CopyBtn text={entry.caption} uid={`${entry.id}-caption`} />
                </div>
              </td>

              {/* Tags */}
              <td>
                <div className="cell-text">
                  <div className="tag-list">
                    {entry.tags ? entry.tags.split(',').slice(0, 3).map((t, i) => (
                      <span key={i} className="tag">{t.trim()}</span>
                    )) : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>—</span>}
                  </div>
                  {entry.tags && <CopyBtn text={entry.tags} uid={`${entry.id}-tags`} />}
                </div>
              </td>

              {/* Source */}
              <td>
                <div className="cell-text">
                  <span style={{ color: entry.sourceInfo ? 'var(--text-link)' : 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                    {entry.sourceInfo || '—'}
                  </span>
                  {entry.sourceInfo && <CopyBtn text={entry.sourceInfo} uid={`${entry.id}-source`} />}
                </div>
              </td>

              {/* Date */}
              <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {entry.date}
              </td>

              {/* Status */}
              <td>
                <span className={`badge ${entry.status ? 'approved' : 'draft'}`}>
                  {entry.status ? 'Approved' : 'Draft'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
