import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

// GET: একটি ইনভয়েস পড়া
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Invoices!A1:M',
    });

    const rows = response.data.values || [];
    const invoiceRow = rows.find(row => row[0] === id);
    if (!invoiceRow) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 },
      );
    }

    const invoice = {
      invoiceNo: invoiceRow[0] || '',
      clientName: invoiceRow[1] || '',
      clientAddress: invoiceRow[2] || '',
      clientSiret: invoiceRow[3] || '',
      date: invoiceRow[4] || '',
      dueDate: invoiceRow[5] || '',
      paymentMethod: invoiceRow[6] || 'Virement',
      items: invoiceRow[7] || '[]',
      totalHT: invoiceRow[8] || '0',
      tva: invoiceRow[9] || '0',
      totalTTC: invoiceRow[10] || '0',
      status: invoiceRow[11] || 'Pending',
    };

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT: ইনভয়েস আপডেট
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    // পুরো ডেটা পড়ে সারি নম্বর বের করা
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Invoices!A1:M',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 },
      );
    }

    // আপডেট করা ডেটা
    const updatedRow = [
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

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Invoices!A${rowIndex + 1}:M${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE: ইনভয়েস ডিলিট
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Invoices!A1:M',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 },
      );
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `Invoices!A${rowIndex + 1}:M${rowIndex + 1}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
