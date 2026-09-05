// lib/googleSheets.js
import { google } from 'googleapis';
import { getAppConfig } from './config';
import { ensureAllSheets } from './sheetSetup';

let activeClientCache = null;
let activeSourceName = 'MAIN';
let lastErrorMessage = null;
let setupInitialized = false;

// 🔒 অথেনটিকেশন তৈরি
function createAuth(clientEmail, privateKey) {
  try {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('Auth creation failed:', error.message);
    throw error;
  }
}

// 🧠 অ্যাক্টিভ শিট ক্লায়েন্ট বের করা (ফেইলওভার লজিক সহ)
async function getActiveSheetClient() {
  // ক্যাশ থেকে রিটার্ন
  if (activeClientCache) {
    return activeClientCache;
  }

  const config = await getAppConfig();

  const mainId = config.MAIN_SHEET_ID;
  const mainEmail = config.MAIN_CLIENT_EMAIL;
  const mainKey = config.MAIN_PRIVATE_KEY;

  const backupId = config.BACKUP_SHEET_ID || mainId;
  const backupEmail = config.BACKUP_CLIENT_EMAIL || mainEmail;
  const backupKey = config.BACKUP_PRIVATE_KEY || mainKey;

  const preferredSource = config.ACTIVE_SOURCE || 'MAIN';

  let firstSource, firstId, firstEmail, firstKey, firstName;
  let secondSource, secondId, secondEmail, secondKey, secondName;

  if (preferredSource === 'MAIN') {
    firstSource = 'MAIN';
    firstName = 'Main';
    firstId = mainId;
    firstEmail = mainEmail;
    firstKey = mainKey;
    secondSource = 'BACKUP';
    secondName = 'Backup';
    secondId = backupId;
    secondEmail = backupEmail;
    secondKey = backupKey;
  } else {
    firstSource = 'BACKUP';
    firstName = 'Backup';
    firstId = backupId;
    firstEmail = backupEmail;
    firstKey = backupKey;
    secondSource = 'MAIN';
    secondName = 'Main';
    secondId = mainId;
    secondEmail = mainEmail;
    secondKey = mainKey;
  }

  // প্রথম চেষ্টা
  try {
    const auth = createAuth(firstEmail, firstKey);
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.get({ spreadsheetId: firstId });

    activeClientCache = { sheets, id: firstId, source: firstSource };
    activeSourceName = firstSource;
    lastErrorMessage = null;
    console.log(`✅ Active: ${firstName} sheet (${firstId})`);

    // শিট সেটআপ (শুধু একবার)
    if (!setupInitialized) {
      setupInitialized = true;
      const setupResult = await ensureAllSheets();
      if (!setupResult.success) {
        console.warn('⚠️ Sheet setup warning:', setupResult.error);
      }
    }

    return activeClientCache;
  } catch (firstError) {
    console.warn(`⚠️ ${firstName} sheet failed. Switching to ${secondName}...`);
    lastErrorMessage = `⚠️ ${firstName} failed. Using ${secondName}.`;

    try {
      const auth = createAuth(secondEmail, secondKey);
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.get({ spreadsheetId: secondId });

      activeClientCache = { sheets, id: secondId, source: secondSource };
      activeSourceName = secondSource;
      console.log(`✅ Switched to: ${secondName} sheet (${secondId})`);

      // শিট সেটআপ (শুধু একবার)
      if (!setupInitialized) {
        setupInitialized = true;
        const setupResult = await ensureAllSheets();
        if (!setupResult.success) {
          console.warn('⚠️ Sheet setup warning:', setupResult.error);
        }
      }

      return activeClientCache;
    } catch (secondError) {
      const criticalMsg = `🚨 CRITICAL: Both sheets are DOWN!`;
      console.error(criticalMsg, secondError.message);
      lastErrorMessage = criticalMsg;
      throw new Error(
        criticalMsg + ` Check AppConfig. (${secondError.message})`,
      );
    }
  }
}

// 📤 এক্সপোর্ট ১: শুধু শিটস ক্লায়েন্ট
export async function getSheetsClient() {
  const client = await getActiveSheetClient();
  return client.sheets;
}

// 📤 এক্সপোর্ট ২: বর্তমান অ্যাক্টিভ শিটের আইডি
export async function getActiveSheetId() {
  const client = await getActiveSheetClient();
  return client.id;
}

// 📤 এক্সপোর্ট ৩: সিস্টেম স্ট্যাটাস
export async function getSystemStatus() {
  try {
    await getActiveSheetClient();
    return {
      status: 'healthy',
      active: activeSourceName,
      message: lastErrorMessage || 'All systems operational.',
    };
  } catch (error) {
    return {
      status: 'critical',
      active: 'none',
      message: error.message,
    };
  }
}

// 📤 এক্সপোর্ট ৪: নতুন ইনভয়েস যোগ করা
export async function addInvoice(data) {
  const sheets = await getSheetsClient();
  const sheetId = await getActiveSheetId();

  const range = 'Invoices!A1';
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
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
        ],
      ],
    },
  });
  return response.data;
}

// 📤 এক্সপোর্ট ৫: সব ইনভয়েস পড়া
export async function getInvoices() {
  const sheets = await getSheetsClient();
  const sheetId = await getActiveSheetId();

  const range = 'Invoices!A1:M';
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });
    return response.data.values || [];
  } catch (error) {
    console.warn('Reading invoices failed:', error.message);
    return [];
  }
}

// 📤 এক্সপোর্ট ৬: (ঐচ্ছিক) ক্যাশ রিসেট
export function resetSheetsCache() {
  activeClientCache = null;
  console.log('🔄 Sheets cache reset.');
}
