'use client';

import React, { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import DataTable from '@/components/DataTable';

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch entries from API on load
  useEffect(() => {
    fetch('/api/entries')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleAddEntry = (entry: any) => {
    setEntries(prev => [entry, ...prev]);
    showToast('Uploaded & scrubbed');
  };

  const handleDeleteEntry = async (id: string) => {
    // Optimistic update
    setEntries(prev => prev.filter(e => e.id !== id));
    showToast('Deleting...');
    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Entry deleted');
    } else {
      // Rollback — refetch
      const data = await fetch('/api/entries').then(r => r.json());
      setEntries(data);
      showToast('Delete failed');
    }
  };

  const handleUpdateEntry = async (updated: any) => {
    // Optimistic update
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    const res = await fetch(`/api/entries/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      showToast('Entry updated');
    } else {
      const data = await fetch('/api/entries').then(r => r.json());
      setEntries(data);
      showToast('Update failed');
    }
  };

  const imageCount = entries.filter(e => e.mediaType === 'image').length;
  const videoCount = entries.filter(e => e.mediaType === 'video').length;

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex' }}><ShieldIcon /></span>
            Airlock
          </span>
        </h1>
        <p>Private media pipeline · metadata scrubbed on entry</p>
      </header>

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

      <div className="toolbar">
        <div className="toolbar-left" />
        <div className="toolbar-right">
          <EntryForm onSuccess={handleAddEntry} />
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading entries...</p></div>
      ) : (
        <DataTable
          entries={entries}
          onToast={showToast}
          onDelete={handleDeleteEntry}
          onUpdate={handleUpdateEntry}
        />
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
