// lib/config.js
import 'server-only';
import { google } from 'googleapis';
import { ensureAllSheets } from './sheetSetup';

const CONFIG_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

let cachedConfig = null;
let lastFetch = 0;

async function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// 🆕 AppConfig থেকে ডেটা পড়া
export async function getAppConfig() {
  const now = Date.now();
  if (cachedConfig && now - lastFetch < 5 * 60 * 1000) {
    return cachedConfig;
  }

  // শিট সেটআপ নিশ্চিত
  await ensureAllSheets();

  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG_SHEET_ID,
      range: 'AppConfig!A1:B',
    });

    const rows = response.data.values || [];
    const config = {};
    rows.forEach(row => {
      if (row.length >= 2) {
        config[row[0]] = row[1];
      }
    });

    // ডিফল্ট মান
    const defaultConfig = {
      MAIN_SHEET_ID: process.env.GOOGLE_SHEET_ID,
      MAIN_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
      MAIN_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
      ACTIVE_SOURCE: 'MAIN',
    };

    cachedConfig = { ...defaultConfig, ...config };
    lastFetch = now;
    return cachedConfig;
  } catch (error) {
    console.error('Failed to load AppConfig:', error);
    return {
      MAIN_SHEET_ID: process.env.GOOGLE_SHEET_ID,
      MAIN_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
      MAIN_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
      ACTIVE_SOURCE: 'MAIN',
    };
  }
}

// 🆕 AppConfig আপডেট
export async function updateAppConfig(updates) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // প্রথমে সব ডেটা পড়ে নিচ্ছি
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG_SHEET_ID,
    range: 'AppConfig!A1:B',
  });

  const rows = response.data.values || [];
  const existingKeys = rows.map(row => row[0]);

  // আপডেট/যোগ করার জন্য অপারেশন
  const updatePromises = Object.entries(updates).map(async ([key, value]) => {
    const rowIndex = existingKeys.indexOf(key);
    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG_SHEET_ID,
        range: `AppConfig!B${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[value]] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG_SHEET_ID,
        range: 'AppConfig!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [[key, value]] },
      });
    }
  });

  await Promise.all(updatePromises);
  cachedConfig = null;
  return true;
}
