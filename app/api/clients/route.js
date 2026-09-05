import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Clients!A1:E',
    });

    const rows = response.data.values || [];
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error reading clients:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    // 🔥 ফোন নাম্বারকে টেক্সট ফরম্যাটে কনভার্ট করা হচ্ছে
    let phone = String(data.phone || '').trim();
    // যদি + বা ০০ দিয়ে শুরু হয়, তাহলে সেটা টেক্সট হিসেবে রাখার জন্য ' (অ্যাপোস্ট্রফি) যোগ করছি
    if (phone.startsWith('+') || phone.startsWith('00')) {
      phone = `'${phone}`; // Google Sheets-এ টেক্সট হিসেবে সংরক্ষণ
    }

    const row = [
      String(data.name || '').trim(),
      String(data.email || '').trim(),
      phone, // আপডেটেড ফোন নাম্বার
      String(data.address || '').trim(),
      String(data.optionalFields || '[]'),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Clients!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
