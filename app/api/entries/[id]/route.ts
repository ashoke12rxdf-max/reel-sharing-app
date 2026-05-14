import { NextRequest, NextResponse } from 'next/server';
import { getEntries, saveEntries, deleteMedia } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// UPDATE an entry's metadata
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const entries = await getEntries();
    const idx = entries.findIndex(e => e.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Only allow updating text/meta fields, not the media itself
    entries[idx] = {
      ...entries[idx],
      title: updates.title ?? entries[idx].title,
      overlay: updates.overlay ?? entries[idx].overlay,
      caption: updates.caption ?? entries[idx].caption,
      tags: updates.tags ?? entries[idx].tags,
      notes: updates.notes ?? entries[idx].notes,
    };

    await saveEntries(entries);
    return NextResponse.json({ success: true, entry: entries[idx] });
  } catch (error: any) {
    console.error('Update failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE an entry + its media file
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entries = await getEntries();
    const entry = entries.find(e => e.id === params.id);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Delete the media file from Vercel Blob
    await deleteMedia(entry.mediaUrl);

    // Remove from index
    const filtered = entries.filter(e => e.id !== params.id);
    await saveEntries(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
