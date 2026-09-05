// app/api/admin/config/route.js
import { getAppConfig, updateAppConfig } from '@/lib/config';
import { NextResponse } from 'next/server';

function isAdmin(request) {
  const cookie = request.cookies.get('invoice_auth');
  return cookie?.value === 'true';
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getAppConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await updateAppConfig(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
