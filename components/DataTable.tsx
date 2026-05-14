'use client';

import React from 'react';
import { Play, FileText, Calendar, Tag, ShieldCheck, Download, Copy } from 'lucide-react';

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

interface DataTableProps {
  entries: Entry[];
}

export default function DataTable({ entries }: DataTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast would go here
  };

  return (
    <div className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-color bg-white/5">
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Media</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Metadata Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Source & Tags</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                  No data entries yet. Inject your first media file above.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-black flex items-center justify-center relative shadow-lg">
                      {entry.mediaType === 'image' ? (
                        <img src={entry.mediaUrl} alt={entry.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="relative w-full h-full group/video">
                          <video 
                            src={entry.mediaUrl} 
                            className="w-full h-full object-cover" 
                            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                            muted
                            loop
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/video:bg-transparent transition-all">
                            <Play size={20} className="text-white fill-white group-hover/video:opacity-0" />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{entry.title}</h4>
                      <p className="text-sm text-secondary line-clamp-2">{entry.caption}</p>
                      {entry.notes && (
                        <p className="mt-2 text-xs text-secondary/60 italic">Note: {entry.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry.isCleaned ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                        <ShieldCheck size={14} /> SCRUBBED
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                        UNSECURE
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        <Tag size={12} /> {entry.tags || 'No tags'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-400/80 cursor-pointer hover:text-blue-300">
                        <FileText size={12} /> {entry.sourceInfo || 'Internal'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {entry.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`w-3 h-3 rounded-full ${entry.status ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-700'}`} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
