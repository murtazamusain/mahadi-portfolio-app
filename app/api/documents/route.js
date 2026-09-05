// app/api/documents/route.js
import { getSheetsClient, getActiveSheetId } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

// GET: সব ডকুমেন্ট পড়া
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    // Documents শিট থেকে ডেটা পড়া
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Documents!A:C',
    });

    const rows = response.data.values || [];
    console.log('📥 Documents loaded from sheet:', rows.length, 'rows');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Error reading documents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST: ডকুমেন্ট সেভ
export async function POST(request) {
  try {
    const { documents } = await request.json();
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    console.log('📝 Saving', documents.length, 'documents to Google Sheets');

    // ১. Documents শিটে ডেটা ক্লিয়ার
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: 'Documents!A:C',
      });
      console.log('🧹 Cleared Documents sheet');
    } catch (clearError) {
      console.log(
        '⚠️ Could not clear sheet, may be empty:',
        clearError.message,
      );
    }

    // ২. হেডার তৈরি
    const header = [['Document Data (JSON)', 'Details', 'Required']];

    // ৩. ডেটা তৈরি (JSON স্ট্রিং আকারে)
    const dataToWrite = documents.map(doc => {
      const docData = {
        title: doc.title || 'Untitled',
        fields: doc.fields || [],
      };
      return [JSON.stringify(docData), '', doc.required ? 'true' : 'false'];
    });

    const allData = [...header, ...dataToWrite];
    console.log('📤 Writing', allData.length, 'rows to sheet');

    // ৪. ডেটা লেখা
    if (allData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Documents!A1',
        valueInputOption: 'RAW',
        requestBody: { values: allData },
      });
      console.log('✅ Documents saved successfully!');
    }

    return NextResponse.json({ success: true, count: documents.length });
  } catch (error) {
    console.error('❌ Error saving documents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
