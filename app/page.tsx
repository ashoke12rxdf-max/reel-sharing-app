'use client';

import React, { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import DataTable from '@/components/DataTable';

// Inline SVG icons
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('airlock_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const save = (next: any[]) => {
    setEntries(next);
    localStorage.setItem('airlock_entries', JSON.stringify(next));
  };

  const handleAddEntry = (entry: any) => {
    save([entry, ...entries]);
    showToast('Entry saved — metadata scrubbed');
  };

  const handleDeleteEntry = (id: string) => {
    save(entries.filter(e => e.id !== id));
    showToast('Entry deleted');
  };

  const handleUpdateEntry = (updated: any) => {
    save(entries.map(e => e.id === updated.id ? updated : e));
    showToast('Entry updated');
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const imageCount = entries.filter(e => e.mediaType === 'image').length;
  const videoCount = entries.filter(e => e.mediaType === 'video').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex' }}><ShieldIcon /></span>
            Airlock
          </span>
        </h1>
        <p>Private media pipeline · metadata scrubbed on entry</p>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-dot" style={{ background: 'var(--text-primary)' }} />
          {entries.length} entries
        </div>
        <div className="stat-item">
          <span className="stat-dot" style={{ background: 'var(--purple)' }} />
          {imageCount} images
        </div>
        <div className="stat-item">
          <span className="stat-dot" style={{ background: 'var(--orange)' }} />
          {videoCount} videos
        </div>
        <div className="stat-item">
          <span className="stat-dot" style={{ background: 'var(--green)' }} />
          {entries.filter(e => e.status).length} approved
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left" />
        <div className="toolbar-right">
          <EntryForm onSuccess={handleAddEntry} />
        </div>
      </div>

      {/* Table */}
      <DataTable
        entries={entries}
        onToast={showToast}
        onDelete={handleDeleteEntry}
        onUpdate={handleUpdateEntry}
      />

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
