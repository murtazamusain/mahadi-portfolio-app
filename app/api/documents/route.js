// app/api/documents/route.js
import { getDocuments } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getDocuments();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error reading documents:', error);

    if (error.message.includes('Quota exceeded')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait a moment.',
          quotaExceeded: true,
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
