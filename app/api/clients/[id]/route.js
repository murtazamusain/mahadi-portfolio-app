import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    // পুরো ডেটা পড়ে সারি নম্বর বের করা
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Clients!A1:E',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      row => row[0] === data.name && row[1] === data.email,
    );
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 },
      );
    }

    // 🔥 ফোন নাম্বার টেক্সট ফরম্যাটে
    let phone = String(data.phone || '').trim();
    if (phone.startsWith('+') || phone.startsWith('00')) {
      phone = `'${phone}`;
    }

    const updatedRow = [
      String(data.name || '').trim(),
      String(data.email || '').trim(),
      phone,
      String(data.address || '').trim(),
      String(data.optionalFields || '[]'),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Clients!A${rowIndex + 1}:E${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Clients!A1:E',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 },
      );
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `Clients!A${rowIndex + 1}:E${rowIndex + 1}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
