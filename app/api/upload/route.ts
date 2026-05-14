import { NextRequest, NextResponse } from 'next/server';
import { getEntries, saveEntries, uploadMedia, type EntryData } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const metaRaw = formData.get('meta') as string;

    if (!file || !metaRaw) {
      return NextResponse.json({ error: 'Missing file or metadata' }, { status: 400 });
    }

    const meta = JSON.parse(metaRaw);

    // Convert file to buffer and upload to Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, pathname } = await uploadMedia(buffer, file.name, file.type);

    // Build entry
    const entry: EntryData = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title: meta.title || '',
      overlay: meta.overlay || '',
      caption: meta.caption || '',
      tags: meta.tags || '',
      notes: meta.notes || '',
      mediaType: file.type.startsWith('image/') ? 'image' : 'video',
      mediaUrl: url,
      mediaBlobPath: pathname,
      fileName: file.name,
      fileSize: buffer.length,
      isCleaned: true,
      createdAt: new Date().toISOString(),
    };

    // Append to index
    const entries = await getEntries();
    entries.unshift(entry);
    await saveEntries(entries);

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
