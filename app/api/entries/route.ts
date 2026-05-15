import { NextRequest, NextResponse } from 'next/server';
import { getEntries, saveEntries, type EntryData } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all entries
export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — save a new entry's metadata (called by client after file upload succeeds)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry: EntryData = {
      id: body.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title: body.title || '',
      overlay: body.overlay || '',
      caption: body.caption || '',
      tags: body.tags || '',
      notes: body.notes || '',
      mediaType: body.mediaType || 'image',
      mediaUrl: body.mediaUrl || '',
      mediaBlobPath: body.mediaBlobPath || '',
      fileName: body.fileName || 'file',
      fileSize: body.fileSize || 0,
      isCleaned: true,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (!entry.mediaUrl) {
      return NextResponse.json({ error: 'Missing mediaUrl' }, { status: 400 });
    }

    const entries = await getEntries();
    entries.unshift(entry);
    await saveEntries(entries);

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('Save entry failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
