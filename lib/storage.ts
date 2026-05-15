import { put, list, del } from '@vercel/blob';

export interface EntryData {
  id: string;
  title: string;
  overlay: string;
  caption: string;
  tags: string;
  notes: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  mediaBlobPath: string;
  fileName: string;
  fileSize: number;
  isCleaned: boolean;
  createdAt: string;
}

const ENTRY_PREFIX = 'entries/';

/**
 * Get all entries by listing individual entry blobs.
 * Each entry is stored as its own blob — no shared index to get stale.
 */
export async function getEntries(): Promise<EntryData[]> {
  try {
    const { blobs } = await list({ prefix: ENTRY_PREFIX });
    if (blobs.length === 0) return [];

    // Fetch all entry blobs in parallel
    const entries = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url + '?t=' + Date.now(), { cache: 'no-store' });
          if (!res.ok) return null;
          const data = await res.json();
          return data as EntryData;
        } catch {
          return null;
        }
      })
    );

    // Filter out failed fetches, sort newest first
    return entries
      .filter((e): e is EntryData => e !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('getEntries failed:', err);
    return [];
  }
}

/**
 * Save a single entry as its own blob.
 * No shared index — no race conditions.
 */
export async function saveEntry(entry: EntryData): Promise<void> {
  await put(`${ENTRY_PREFIX}${entry.id}.json`, JSON.stringify(entry), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

/**
 * Delete a single entry blob + its media file.
 */
export async function deleteEntry(id: string): Promise<void> {
  // Find the entry blob to get its media URL
  const { blobs } = await list({ prefix: `${ENTRY_PREFIX}${id}` });

  for (const blob of blobs) {
    try {
      // Read the entry to find its media URL
      const res = await fetch(blob.url + '?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const entry = await res.json() as EntryData;
        // Delete the media file
        if (entry.mediaUrl) {
          try { await del(entry.mediaUrl); } catch {}
        }
      }
    } catch {}

    // Delete the entry blob itself
    await del(blob.url);
  }
}

/**
 * Update an entry's metadata (keeps media unchanged).
 */
export async function updateEntry(id: string, updates: Partial<EntryData>): Promise<EntryData | null> {
  const { blobs } = await list({ prefix: `${ENTRY_PREFIX}${id}` });
  if (blobs.length === 0) return null;

  const res = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) return null;

  const existing = await res.json() as EntryData;
  const updated: EntryData = {
    ...existing,
    title: updates.title ?? existing.title,
    overlay: updates.overlay ?? existing.overlay,
    caption: updates.caption ?? existing.caption,
    tags: updates.tags ?? existing.tags,
    notes: updates.notes ?? existing.notes,
  };

  await saveEntry(updated);
  return updated;
}
