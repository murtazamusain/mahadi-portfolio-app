// app/api/content/route.js
import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

// GET: সব কন্টেন্ট পড়া
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'SiteContent!A1:D',
    });

    const rows = response.data.values || [];
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST: সব কন্টেন্ট আপডেট (পূরো শিট রিপ্লেস)
export async function POST(request) {
  try {
    const { content } = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    // পুরোনো ডেটা ক্লিয়ার
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'SiteContent!A1:D',
    });

    // নতুন ডেটা লেখা (হেডার সহ)
    const header = [['Section', 'Key', 'Value', 'Type']];
    const dataToWrite = content.map(item => [
      item.section || 'General',
      item.key,
      String(item.value || ''),
      item.type || 'text',
    ]);

    const allData = [...header, ...dataToWrite];

    if (allData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'SiteContent!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: allData },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
