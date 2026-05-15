import { NextRequest, NextResponse } from 'next/server';
import { deleteEntry, updateEntry } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// UPDATE an entry's metadata
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const updated = await updateEntry(params.id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: any) {
    console.error('Update failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE an entry + its media file
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteEntry(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
