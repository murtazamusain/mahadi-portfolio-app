// app/api/estimates/[id]/route.js
import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

// GET: একটি এস্টিমেট পড়া
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Estimates!A1:O',
    });

    const rows = response.data.values || [];
    const estimateRow = rows.find(row => row[0] === id);
    if (!estimateRow) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 },
      );
    }

    const estimate = {
      estimateNo: estimateRow[0] || '',
      date: estimateRow[1] || '',
      validUntil: estimateRow[2] || '',
      clientName: estimateRow[3] || '',
      clientEmail: estimateRow[4] || '',
      clientPhone: estimateRow[5] || '',
      clientAddress: estimateRow[6] || '',
      items: estimateRow[7] || '[]',
      subtotal: estimateRow[8] || '0',
      taxAmount: estimateRow[9] || '0',
      total: estimateRow[10] || '0',
      notes: estimateRow[11] || '',
      terms: estimateRow[12] || '',
      status: estimateRow[13] || 'Draft',
      taxRate: estimateRow[14] || '10', // 🆕 taxRate
    };

    return NextResponse.json({ success: true, data: estimate });
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT: এস্টিমেট আপডেট
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Estimates!A1:O',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 },
      );
    }

    const updatedRow = [
      data.estimateNo,
      data.date,
      data.validUntil,
      data.clientName,
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
      data.taxRate || '10',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Estimates!A${rowIndex + 1}:O${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating estimate:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE: এস্টিমেট ডিলিট
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Estimates!A1:O',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 },
      );
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `Estimates!A${rowIndex + 1}:O${rowIndex + 1}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
