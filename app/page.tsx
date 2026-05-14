'use client';

import React, { useState, useEffect } from 'react';
import EntryForm from '@/components/EntryForm';
import DataTable from '@/components/DataTable';
import MobileView from '@/components/MobileView';
import { Smartphone, Monitor, Shield, Zap } from 'lucide-react';

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Load from local storage for demo persistence
  useEffect(() => {
    const saved = localStorage.getItem('airlock_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const handleAddEntry = (entry: any) => {
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    localStorage.setItem('airlock_entries', JSON.stringify(newEntries));
  };

  return (
    <main className="min-h-screen p-4 md:p-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
              Privacy <span className="text-blue-500">Airlock</span>
            </h1>
          </div>
          <p className="text-secondary font-medium max-w-md">
            Advanced metadata scrubbing pipeline & high-performance media transfer grid.
          </p>
        </div>

        {/* View Toggle */}
        <div className="glass p-1 flex rounded-xl border-white/5">
          <button 
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-secondary hover:text-white'}`}
          >
            <Monitor size={16} /> Dashboard
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-secondary hover:text-white'}`}
          >
            <Smartphone size={16} /> Mobile Transfer
          </button>
        </div>
      </header>

      {/* Stats / Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
          <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Queue Status</div>
          <div className="text-2xl font-black flex items-center gap-2 text-white">
            <Zap size={20} className="text-blue-400" />
            {entries.length} Active Entries
          </div>
        </div>
        <div className="glass p-6 border-green-500/20 bg-green-500/5">
          <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Pipeline Health</div>
          <div className="text-2xl font-black text-green-400">100% Scrubbed</div>
        </div>
        <div className="glass p-6 border-purple-500/20 bg-purple-500/5">
          <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Last Sync</div>
          <div className="text-2xl font-black text-white">Just Now</div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'desktop' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Data Entry Grid</h2>
            <EntryForm onSuccess={handleAddEntry} />
          </div>
          <DataTable entries={entries} />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <MobileView entries={entries} />
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center">
        <p className="text-xs text-secondary/40 font-mono tracking-widest">
          SYSTEM_VERSION: 1.0.4 | ENGINE: NEXT_APP_ROUTER | PIPELINE: METADATA_STRIPPER_v2
        </p>
      </footer>
    </main>
  );
}
