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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

interface MobileViewProps {
  entries: Entry[];
  onToast: (msg: string) => void;
}

export default function MobileView({ entries, onToast }: MobileViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback((text: string, uid: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(uid);
      onToast('Copied');
      setTimeout(() => setCopiedId(null), 1000);
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

  const CopyButton = ({ text, uid }: { text: string; uid: string }) => {
    const isCopied = copiedId === uid;
    return (
      <button
        className={`mobile-copy-btn ${isCopied ? 'copied' : ''}`}
        onClick={() => copy(text, uid)}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </button>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>No files in transfer queue.</p>
      </div>
    );
  }

  return (
    <div className="mobile-view">
      {entries.map((entry) => (
        <div key={entry.id} className="mobile-card">
          <div className="mobile-card-header">
            <span className="mobile-card-title">{entry.title}</span>
            <span
              className="mobile-card-type"
              style={{
                background: entry.mediaType === 'image' ? 'var(--purple-muted)' : 'var(--orange-muted)',
                color: entry.mediaType === 'image' ? 'var(--purple)' : 'var(--orange)',
              }}
            >
              {entry.mediaType === 'image' ? 'IMG' : 'VID'}
            </span>
          </div>
          <div className="mobile-card-body">
            {/* Each text field as a row with one-tap copy */}
            {entry.caption && (
              <div className="mobile-field">
                <span className="mobile-field-label">Caption</span>
                <span className="mobile-field-value">{entry.caption}</span>
                <CopyButton text={entry.caption} uid={`m-${entry.id}-caption`} />
              </div>
            )}
            {entry.tags && (
              <div className="mobile-field">
                <span className="mobile-field-label">Tags</span>
                <span className="mobile-field-value">{entry.tags}</span>
                <CopyButton text={entry.tags} uid={`m-${entry.id}-tags`} />
              </div>
            )}
            {entry.notes && (
              <div className="mobile-field">
                <span className="mobile-field-label">Notes</span>
                <span className="mobile-field-value">{entry.notes}</span>
                <CopyButton text={entry.notes} uid={`m-${entry.id}-notes`} />
              </div>
            )}
            {entry.sourceInfo && (
              <div className="mobile-field">
                <span className="mobile-field-label">Source</span>
                <span className="mobile-field-value">{entry.sourceInfo}</span>
                <CopyButton text={entry.sourceInfo} uid={`m-${entry.id}-source`} />
              </div>
            )}

            {/* Download button */}
            <button
              className="mobile-download"
              onClick={() => download(entry.mediaUrl, `clean-${entry.fileName}`)}
            >
              <DownloadIcon /> Download Clean File
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
