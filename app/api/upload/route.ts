import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getEntries, saveEntries, type EntryData } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * This endpoint handles Vercel Blob CLIENT uploads.
 * Files go directly from browser → Vercel Blob CDN.
 * They never pass through this serverless function,
 * so there is NO 4.5MB payload limit.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // You can add auth checks here
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called by Vercel after the upload finishes.
        // We save the entry metadata here.
        try {
          const meta = tokenPayload ? JSON.parse(tokenPayload as string) : {};
          const entry: EntryData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            title: meta.title || '',
            overlay: meta.overlay || '',
            caption: meta.caption || '',
            tags: meta.tags || '',
            notes: meta.notes || '',
            mediaType: blob.contentType?.startsWith('image/') ? 'image' : 'video',
            mediaUrl: blob.url,
            mediaBlobPath: blob.pathname,
            fileName: blob.pathname.split('/').pop() || 'file',
            fileSize: 0,
            isCleaned: true,
            createdAt: new Date().toISOString(),
          };

          const entries = await getEntries();
          entries.unshift(entry);
          await saveEntries(entries);
        } catch (err) {
          console.error('onUploadCompleted failed:', err);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
