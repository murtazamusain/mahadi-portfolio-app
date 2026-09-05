// app/api/estimates/route.js
import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

// GET: সব এস্টিমেট পড়া
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Estimates!A1:O', // O পর্যন্ত কলাম (taxRate যোগ)
    });

    const rows = response.data.values || [];
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error reading estimates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST: নতুন এস্টিমেট সেভ
export async function POST(request) {
  try {
    const data = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    // 🔥 সঠিক কলাম অনুযায়ী ডেটা (taxRate যোগ)
    const row = [
      data.estimateNo || '',
      data.date || '',
      data.validUntil || '',
      data.clientName || '',
      data.clientEmail || '',
      data.clientPhone || '',
      data.clientAddress || '',
      data.items || '[]',
      data.subtotal || '0',
      data.taxAmount || '0',
      data.total || '0',
      data.notes || '',
      data.terms || '',
      data.status || 'Draft',
      data.taxRate || '10', // 🆕 taxRate কলাম
    ];

    console.log('📤 Saving estimate:', row); // ডিবাগিং

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Estimates!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving estimate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
