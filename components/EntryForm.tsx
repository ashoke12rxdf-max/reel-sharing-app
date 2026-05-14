'use client';

import React, { useState, useRef } from 'react';

interface EntryFormProps {
  onSuccess: (entry: any) => void;
}

// Inline SVG icons to avoid any import issues
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '', caption: '', tags: '', notes: '', sourceInfo: '',
    status: false, date: new Date().toISOString().split('T')[0],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setFormData({ title: '', caption: '', tags: '', notes: '', sourceInfo: '', status: false, date: new Date().toISOString().split('T')[0] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const mediaUrl = URL.createObjectURL(file);
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      ...formData,
      mediaType: file.type.startsWith('image/') ? 'image' : 'video',
      mediaUrl,
      fileName: file.name,
      fileSize: file.size,
      isCleaned: true,
      createdAt: new Date().toISOString(),
    };
    onSuccess(entry);
    setIsOpen(false);
    reset();
  };

  const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

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
            {/* Upload zone */}
            <div className="form-row">
              <div
                className={`upload-zone ${file ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {file ? (
                  <>
                    <CheckIcon />
                    <p>{file.type.startsWith('image/') ? 'Image' : 'Video'} selected</p>
                    <div className="upload-filename">{file.name} · {(file.size / 1024).toFixed(0)} KB</div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon"><UploadIcon /></div>
                    <p>Drop file or click to upload</p>
                  </>
                )}
              </div>
            </div>

            {/* Text inputs */}
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
              <button type="submit" className="btn-submit" disabled={!file}>Save Entry</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
