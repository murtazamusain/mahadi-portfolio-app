// app/api/admin/setup/route.js
import { ensureAllSheets } from '@/lib/sheetSetup';
import { NextResponse } from 'next/server';

// 🔒 অ্যাডমিন চেক
function isAdmin(request) {
  const cookie = request.cookies.get('invoice_auth');
  return cookie?.value === 'true';
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await ensureAllSheets();
  return NextResponse.json(result);
}
