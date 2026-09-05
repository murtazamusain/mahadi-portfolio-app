// app/api/invoices/route.js
import { getInvoices, addInvoice } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getInvoices();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error reading invoices:', error);

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

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await addInvoice(data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving invoice:', error);

    if (error.message.includes('Quota exceeded')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Write quota exceeded. Please wait a moment.',
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
