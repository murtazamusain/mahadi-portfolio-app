import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

// GET: সব ইনভয়েস পড়া
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Invoices!A1:M',
    });

    const rows = response.data.values || [];
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error reading invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST: নতুন ইনভয়েস সেভ
export async function POST(request) {
  try {
    const data = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const row = [
      data.invoiceNo,
      data.clientName,
      data.clientAddress,
      data.clientSiret || '',
      data.date,
      data.dueDate,
      data.paymentMethod,
      data.items,
      data.totalHT,
      data.tva,
      data.totalTTC,
      data.status || 'Pending',
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Invoices!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
