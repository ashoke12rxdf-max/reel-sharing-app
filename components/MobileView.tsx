'use client';

import React from 'react';
import { Download, Copy, ShieldCheck, Video, Image as ImageIcon } from 'lucide-react';

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
  isCleaned: boolean;
}

interface MobileViewProps {
  entries: Entry[];
}

export default function MobileView({ entries }: MobileViewProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple visual feedback
    alert('Copied to clipboard!');
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Transfer Hub</h2>
        <div className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold border border-blue-500/30">LOW RAM MODE</div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-secondary opacity-50">Empty Queue</div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="bg-[#151518] border border-white/10 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
            {/* Minimal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white truncate">{entry.title}</h3>
                <div 
                  onClick={() => copyToClipboard(entry.caption)}
                  className="text-sm text-secondary line-clamp-1 flex items-center gap-2 mt-1 active:bg-white/10 p-1 rounded transition-colors"
                >
                  <Copy size={12} /> {entry.caption}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                {entry.mediaType === 'image' ? <ImageIcon size={20} /> : <Video size={20} />}
              </div>
            </div>

            {/* Quick Copy Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => copyToClipboard(entry.tags)}
                className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-lg text-xs font-bold active:scale-95 transition-transform"
              >
                <Copy size={14} /> COPY TAGS
              </button>
              <button 
                onClick={() => copyToClipboard(entry.sourceInfo)}
                className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-lg text-xs font-bold active:scale-95 transition-transform"
              >
                <Copy size={14} /> COPY LINK
              </button>
            </div>

            {/* High-Contrast Download Button */}
            <button 
              onClick={() => triggerDownload(entry.mediaUrl, `clean-${entry.title.replace(/\s+/g, '-')}`)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all text-lg"
            >
              <Download size={24} strokeWidth={3} />
              GET CLEAN FILE
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-green-400 font-bold opacity-80">
              <ShieldCheck size={12} /> METADATA STRIPPED | SECURE TRANSFER
            </div>
          </div>
        ))
      )}
    </div>
  );
}
