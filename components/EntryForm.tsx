'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Calendar, Type, Hash, Info, FileText } from 'lucide-react';

interface EntryFormProps {
  onSuccess: (entry: any) => void;
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    tags: '',
    notes: '',
    sourceInfo: '',
    status: false,
    date: new Date().toISOString().split('T')[0],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Simulate Privacy Airlock Scrubbing & Submission
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      mediaType: file.type.startsWith('image/') ? 'image' : 'video',
      mediaUrl: preview,
      originalName: file.name,
      createdAt: new Date().toISOString(),
      isCleaned: true,
    };

    onSuccess(newEntry);
    setIsOpen(false);
    // Reset form
    setFile(null);
    setPreview(null);
    setFormData({
      title: '',
      caption: '',
      tags: '',
      notes: '',
      sourceInfo: '',
      status: false,
      date: new Date().toISOString().split('T')[0],
    });
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary mb-8">
        <Upload size={18} /> New Entry (Airlock Protected)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-secondary hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Airlock Data Injection
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-color rounded-2xl p-8 text-center cursor-pointer hover:border-accent-primary transition-colors bg-white/5"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,video/*"
            />
            
            {preview ? (
              <div className="relative aspect-video max-h-48 mx-auto rounded-lg overflow-hidden bg-black">
                {file?.type.startsWith('image/') ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <video src={preview} className="w-full h-full object-contain" />
                )}
                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">
                  <Check size={16} />
                </div>
              </div>
            ) : (
              <div className="flex flex-direction-column items-center gap-2 text-secondary">
                <Upload size={48} className="mb-2 opacity-50" />
                <p className="font-medium">Drag & drop or click to upload</p>
                <p className="text-xs">Images and Videos are automatically scrubbed</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 5 Distinct Text Inputs */}
            <div className="input-group">
              <label className="label"><Type size={14} className="inline mr-1" /> Title</label>
              <input 
                required
                className="input" 
                placeholder="Enter title..." 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="label"><FileText size={14} className="inline mr-1" /> Caption</label>
              <input 
                required
                className="input" 
                placeholder="Brief caption..." 
                value={formData.caption}
                onChange={e => setFormData({...formData, caption: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="label"><Hash size={14} className="inline mr-1" /> Tags</label>
              <input 
                className="input" 
                placeholder="comma, separated, tags" 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="label"><Info size={14} className="inline mr-1" /> Source Info</label>
              <input 
                className="input" 
                placeholder="URL or Origin..." 
                value={formData.sourceInfo}
                onChange={e => setFormData({...formData, sourceInfo: e.target.value})}
              />
            </div>
            <div className="input-group md:col-span-2">
              <label className="label">Internal Notes</label>
              <textarea 
                className="input min-h-[100px]" 
                placeholder="Private notes for this entry..." 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            {/* Checkbox & Date Picker */}
            <div className="input-group">
              <label className="label"><Calendar size={14} className="inline mr-1" /> Date</label>
              <input 
                type="date"
                className="input" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.checked})}
                  />
                  <div className="w-12 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <span className="text-sm font-medium">Approved / Ready</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border-color flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Process & Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
