// app/api/clients/route.js
import { getClients } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getClients();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error reading clients:', error);

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
