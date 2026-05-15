'use client';

import React, { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', caption: '', overlay: '', tags: '', notes: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setScrubResult(null);
    setScrubbing(false);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    setFormData({ title: '', caption: '', overlay: '', tags: '', notes: '' });
  };

  const processFile = async (f: File) => {
    setFile(f);
    setScrubResult(null);
    setError(null);
    setScrubbing(true);
    try {
      const result = await scrubFile(f);
      setScrubResult(result);
    } catch (err: any) {
      setError(err.message || 'Scrubbing failed');
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
    setError(null);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const pathname = `media/${Date.now()}-${safeName}`;

      // 1. Upload file directly from browser to Vercel Blob CDN
      const blob = await upload(pathname, scrubResult.blob, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      // 2. Build entry metadata
      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        ...formData,
        mediaType: scrubResult.mediaType,
        mediaUrl: blob.url,
        mediaBlobPath: blob.pathname,
        fileName: file.name,
        fileSize: scrubResult.cleanSize,
        isCleaned: true,
        createdAt: new Date().toISOString(),
      };

      // 3. Save metadata to index — this is the reliable step
      const saveRes = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || 'Failed to save entry');
      }

      onSuccess(entry);
      setIsOpen(false);
      reset();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
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
                className={`upload-zone ${scrubResult ? 'has-file' : ''} ${error ? 'has-error' : ''}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
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
                ) : uploading ? (
                  <>
                    <LoaderIcon />
                    <p style={{ color: 'var(--accent)' }}>Uploading to cloud...</p>
                    <div className="upload-filename">Direct browser-to-CDN transfer</div>
                  </>
                ) : error ? (
                  <>
                    <p style={{ color: 'var(--red)' }}>{error}</p>
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
                    <div className="upload-filename" style={{ fontSize: '0.7rem' }}>Files up to 500MB · metadata auto-scrubbed</div>
                  </>
                )}
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="Entry title" value={formData.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Overlay</label>
              <textarea className="form-input" placeholder="Overlay text..." value={formData.overlay} onChange={e => set('overlay', e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Caption</label>
              <textarea className="form-input" placeholder="Caption text..." value={formData.caption} onChange={e => set('caption', e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Tags</label>
                <input className="form-input" placeholder="comma, separated" value={formData.tags} onChange={e => set('tags', e.target.value)} />
              </div>
              <div className="form-row">
                <label className="form-label">Notes</label>
                <input className="form-input" placeholder="Internal notes" value={formData.notes} onChange={e => set('notes', e.target.value)} />
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
