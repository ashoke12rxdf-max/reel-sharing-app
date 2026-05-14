import { NextResponse } from 'next/server';
import { getEntries } from '@/lib/storage';

// Force dynamic — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}
