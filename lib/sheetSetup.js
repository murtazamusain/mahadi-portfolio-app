// lib/sheetSetup.js
import { getSheetsClient, getActiveSheetId } from './googleSheets';

const REQUIRED_HEADERS = {
  Invoices: [
    'Invoice No',
    'Client Name',
    'Address',
    'SIRET',
    'Date',
    'Due Date',
    'Payment',
    'Items (JSON)',
    'Total HT',
    'TVA',
    'Total TTC',
    'Status',
    'Updated At',
  ],
  Documents: ['Document Data (JSON)', 'Details', 'Required'],
  Clients: ['Name', 'Email', 'Phone', 'Address', 'Notes'],
  Estimates: [
    'Estimate No',
    'Date',
    'Valid Until',
    'Client Name',
    'Client Email',
    'Client Phone',
    'Client Address',
    'Items (JSON)',
    'Subtotal',
    'Tax Amount',
    'Total',
    'Notes',
    'Terms',
    'Status',
    'Tax Rate',
  ],
  SiteContent: ['Section', 'Key', 'Value', 'Type'],
  // 🆕 AppConfig শিট
  AppConfig: ['Key', 'Value', 'Description'],
};

function getColumnLetter(col) {
  let letter = '';
  while (col > 0) {
    const remainder = (col - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

export async function ensureAllSheets() {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'sheets.properties',
    });
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

    for (const [sheetName, requiredHeaders] of Object.entries(
      REQUIRED_HEADERS,
    )) {
      if (!existingSheets.includes(sheetName)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: sheetName },
                },
              },
            ],
          },
        });
        console.log(`✅ Created sheet: ${sheetName}`);

        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${sheetName}!A1:${getColumnLetter(requiredHeaders.length)}1`,
          valueInputOption: 'RAW',
          requestBody: { values: [requiredHeaders] },
        });
      }
    }

    return { success: true, message: 'All sheets configured successfully!' };
  } catch (error) {
    console.error('Error setting up sheets:', error);
    return { success: false, error: error.message };
  }
}
