import { put, list, del, head } from '@vercel/blob';

const INDEX_KEY = 'entries-index.json';

export interface EntryData {
  id: string;
  title: string;
  overlay: string;
  caption: string;
  tags: string;
  notes: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;      // permanent Vercel Blob CDN URL
  mediaBlobPath: string;  // blob pathname for deletion
  fileName: string;
  fileSize: number;
  isCleaned: boolean;
  createdAt: string;
}

/**
 * Read the entries index from Vercel Blob.
 * Returns an empty array if it doesn't exist yet.
 */
export async function getEntries(): Promise<EntryData[]> {
  try {
    const { blobs } = await list({ prefix: INDEX_KEY });
    if (blobs.length === 0) return [];

    const indexBlob = blobs[0];
    // CRITICAL: bypass Next.js fetch cache — without this, stale data is served
    const res = await fetch(indexBlob.url + '?t=' + Date.now(), {
      cache: 'no-store',
    });
    if (!res.ok) return [];

    const data = await res.json();
    return data as EntryData[];
  } catch (err) {
    console.error('getEntries failed:', err);
    return [];
  }
}

/**
 * Write the entries index to Vercel Blob.
 * Overwrites the existing index.
 */
export async function saveEntries(entries: EntryData[]): Promise<void> {
  await put(INDEX_KEY, JSON.stringify(entries), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

/**
 * Upload a clean media file to Vercel Blob.
 * Returns the permanent public URL and blob pathname.
 */
export async function uploadMedia(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; pathname: string }> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `media/${Date.now()}-${safeName}`;

  const blob = await put(pathname, fileBuffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType,
  });

  return { url: blob.url, pathname: blob.pathname };
}

/**
 * Delete a media file from Vercel Blob.
 */
export async function deleteMedia(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // File may already be deleted
  }
}
