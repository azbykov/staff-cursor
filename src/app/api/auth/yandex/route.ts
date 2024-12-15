import { NextResponse } from 'next/server';

export async function GET() {
  const YANDEX_AUTH_URL = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${process.env.YANDEX_CLIENT_ID}&redirect_uri=${process.env.YANDEX_REDIRECT_URI}`;
  
  return NextResponse.redirect(YANDEX_AUTH_URL);
} 