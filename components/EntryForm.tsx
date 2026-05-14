'use client';

import React, { useState, useRef } from 'react';
import { scrubFile, type ScrubResult } from '@/lib/client-scrubber';

interface EntryFormProps {
  onSuccess: (entry: any) => void;
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const LoaderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scrubResult, setScrubResult] = useState<ScrubResult | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scrubError, setScrubError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', caption: '', tags: '', notes: '', sourceInfo: '',
    status: false, date: new Date().toISOString().split('T')[0],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setScrubResult(null);
    setScrubbing(false);
    setUploading(false);
    setScrubError(null);
    setFormData({ title: '', caption: '', tags: '', notes: '', sourceInfo: '', status: false, date: new Date().toISOString().split('T')[0] });
  };

  const processFile = async (f: File) => {
    setFile(f);
    setScrubResult(null);
    setScrubError(null);
    setScrubbing(true);
    try {
      const result = await scrubFile(f);
      setScrubResult(result);
    } catch (err: any) {
      setScrubError(err.message || 'Scrubbing failed');
    } finally {
      setScrubbing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !scrubResult) return;

    setUploading(true);

    try {
      // Build FormData with the CLEAN blob + metadata
      const fd = new FormData();
      fd.append('file', scrubResult.blob, file.name);
      fd.append('meta', JSON.stringify(formData));

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onSuccess(data.entry);
      setIsOpen(false);
      reset();
    } catch (err: any) {
      setScrubError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));
  const formatBytes = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-action primary" id="new-entry-btn">
        <PlusIcon /> New
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setIsOpen(false); reset(); } }}>
      <div className="modal-panel">
        <div className="modal-header">
          <h3>New Entry</h3>
          <button className="modal-close" onClick={() => { setIsOpen(false); reset(); }}><XIcon /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div
                className={`upload-zone ${scrubResult ? 'has-file' : ''} ${scrubError ? 'has-error' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {scrubbing ? (
                  <>
                    <LoaderIcon />
                    <p style={{ color: 'var(--accent)' }}>Scrubbing metadata...</p>
                    <div className="upload-filename">Removing EXIF, GPS, device identifiers</div>
                  </>
                ) : scrubError ? (
                  <>
                    <p style={{ color: 'var(--red)' }}>{scrubError}</p>
                    <div className="upload-filename">Click to try again</div>
                  </>
                ) : scrubResult ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)' }}>
                      <ShieldIcon /> <strong>Metadata stripped</strong>
                    </div>
                    <div className="upload-filename">
                      {file?.name} · {formatBytes(scrubResult.originalSize)} → {formatBytes(scrubResult.cleanSize)}
                    </div>
                    <div className="scrub-details">
                      {scrubResult.stripped.map((s, i) => (
                        <span key={i} className="scrub-tag">✕ {s}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon"><UploadIcon /></div>
                    <p>Drop file or click to upload</p>
                    <div className="upload-filename" style={{ fontSize: '0.7rem' }}>Files are automatically scrubbed before saving</div>
                  </>
                )}
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="Entry title" required value={formData.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Caption</label>
                <input className="form-input" placeholder="Short description" required value={formData.caption} onChange={e => set('caption', e.target.value)} />
              </div>
              <div className="form-row">
                <label className="form-label">Tags</label>
                <input className="form-input" placeholder="comma, separated" value={formData.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Notes</label>
              <textarea className="form-input" placeholder="Internal notes..." value={formData.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Source</label>
                <input className="form-input" placeholder="URL or origin" value={formData.sourceInfo} onChange={e => set('sourceInfo', e.target.value)} />
              </div>
              <div className="form-row">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={formData.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="toggle-row">
                <label className="toggle">
                  <input type="checkbox" checked={formData.status} onChange={e => set('status', e.target.checked)} />
                  <div className="toggle-track" />
                  <div className="toggle-knob" />
                </label>
                <span className="toggle-label">Approved</span>
              </div>
            </div>

            <div className="form-footer">
              <button type="button" className="btn-cancel" onClick={() => { setIsOpen(false); reset(); }}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={!scrubResult || scrubbing || uploading}>
                {uploading ? 'Uploading...' : scrubbing ? 'Scrubbing...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
