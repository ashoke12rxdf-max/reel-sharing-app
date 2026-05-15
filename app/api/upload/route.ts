import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const dynamic = 'force-dynamic';

/**
 * Handles Vercel Blob client upload token generation.
 * Files go directly from browser → Vercel Blob CDN.
 * Metadata is saved separately via POST /api/entries.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
        };
      },
      // We intentionally do NOT save metadata here.
      // The client saves it via POST /api/entries after upload completes.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
