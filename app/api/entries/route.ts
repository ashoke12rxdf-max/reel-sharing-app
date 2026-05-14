import { NextResponse } from 'next/server';
import { getEntries } from '@/lib/storage';

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}
