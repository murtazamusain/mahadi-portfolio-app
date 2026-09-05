// lib/googleSheets.js
import { google } from 'googleapis';
import { getAppConfig } from './config';

// ---------- ক্যাশ ম্যানেজমেন্ট ----------
let cache = {
  invoices: { data: null, timestamp: 0 },
  clients: { data: null, timestamp: 0 },
  estimates: { data: null, timestamp: 0 },
  documents: { data: null, timestamp: 0 },
};
const CACHE_DURATION = 5 * 60 * 1000; // ৫ মিনিট (৩০০ সেকেন্ড)

let activeClientCache = null;
let activeSourceName = 'MAIN';
let lastErrorMessage = null;
let setupInitialized = false;

// ---------- অথেনটিকেশন ----------
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

// ---------- অ্যাক্টিভ শিট ক্লায়েন্ট (ফেইলওভার সহ) ----------
async function getActiveSheetClient() {
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

    if (!setupInitialized) {
      setupInitialized = true;
      const { ensureAllSheets } = await import('./sheetSetup');
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

      if (!setupInitialized) {
        setupInitialized = true;
        const { ensureAllSheets } = await import('./sheetSetup');
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

// ---------- ক্যাশ সহ ডেটা রিড ফাংশন ----------
async function getCachedData(type, fetchFunction) {
  const now = Date.now();
  const cached = cache[type];

  // যদি ক্যাশে ডেটা থাকে এবং ৫ মিনিটের কম হয়, তাহলে ক্যাশ থেকে রিটার্ন
  if (cached.data && now - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Using cached ${type} data`);
    return cached.data;
  }

  // নইলে নতুন ডেটা ফেচ
  try {
    const data = await fetchFunction();
    cache[type] = { data, timestamp: now };
    console.log(`🔄 Fetched fresh ${type} data`);
    return data;
  } catch (error) {
    // যদি কোটা শেষ হয়ে যায়, তাহলে ক্যাশের পুরোনো ডেটা রিটার্ন
    if (error.message.includes('Quota exceeded') && cached.data) {
      console.warn(`⚠️ Quota exceeded. Returning stale ${type} data.`);
      return cached.data;
    }
    throw error;
  }
}

// ---------- রেট লিমিট সেফ রাইট ফাংশন ----------
let lastWriteTime = 0;
const WRITE_DELAY = 1000; // ১ সেকেন্ড delay

async function safeWriteOperation(operation) {
  const now = Date.now();
  const timeSinceLastWrite = now - lastWriteTime;

  if (timeSinceLastWrite < WRITE_DELAY) {
    await new Promise(resolve =>
      setTimeout(resolve, WRITE_DELAY - timeSinceLastWrite),
    );
  }

  try {
    const result = await operation();
    lastWriteTime = Date.now();
    return result;
  } catch (error) {
    if (error.message.includes('Quota exceeded')) {
      throw new Error(
        'Write quota exceeded. Please wait a moment and try again.',
      );
    }
    throw error;
  }
}

// ---------- এক্সপোর্ট ফাংশন ----------
export async function getSheetsClient() {
  const client = await getActiveSheetClient();
  return client.sheets;
}

export async function getActiveSheetId() {
  const client = await getActiveSheetClient();
  return client.id;
}

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

// 🆕 ইনভয়েস যোগ করা (রেট লিমিট সেফ)
export async function addInvoice(data) {
  return safeWriteOperation(async () => {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Invoices!A1',
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

    // ক্যাশ ইনভ্যালিডেট
    cache.invoices = { data: null, timestamp: 0 };

    return response.data;
  });
}

// 🆕 সব ইনভয়েস পড়া (ক্যাশ সহ)
export async function getInvoices() {
  return getCachedData('invoices', async () => {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Invoices!A1:M',
    });

    return response.data.values || [];
  });
}

// 🆕 ক্লায়েন্ট পড়া (ক্যাশ সহ)
export async function getClients() {
  return getCachedData('clients', async () => {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Clients!A1:E',
    });

    return response.data.values || [];
  });
}

// 🆕 এস্টিমেট পড়া (ক্যাশ সহ)
export async function getEstimates() {
  return getCachedData('estimates', async () => {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Estimates!A1:N',
    });

    return response.data.values || [];
  });
}

// 🆕 ডকুমেন্ট পড়া (ক্যাশ সহ)
export async function getDocuments() {
  return getCachedData('documents', async () => {
    const sheets = await getSheetsClient();
    const sheetId = await getActiveSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Documents!A1:C',
    });

    return response.data.values || [];
  });
}

// 🔄 ক্যাশ রিসেট (যদি জোর করে রিলোড করতে চান)
export function resetSheetsCache() {
  cache = {
    invoices: { data: null, timestamp: 0 },
    clients: { data: null, timestamp: 0 },
    estimates: { data: null, timestamp: 0 },
    documents: { data: null, timestamp: 0 },
  };
  activeClientCache = null;
  console.log('🔄 All caches reset.');
}
