import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getYandexToken(code: string) {
  const response = await fetch('https://oauth.yandex.ru/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.YANDEX_CLIENT_ID!,
      client_secret: process.env.YANDEX_CLIENT_SECRET!,
      redirect_uri: process.env.YANDEX_REDIRECT_URI!,
    }),
  });

  return response.json();
}

async function getYandexUserInfo(accessToken: string) {
  const response = await fetch('https://login.yandex.ru/info', {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  return response.json();
}

export async function GET(request: Request) {
  try {
    // Получаем код из URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect('/auth/login?error=no_code');
    }

    // Обмениваем код на токен
    const tokenData = await getYandexToken(code);
    
    if (!tokenData.access_token) {
      return NextResponse.redirect('/auth/login?error=no_token');
    }

    // Получаем информацию о пользователе
    const userInfo = await getYandexUserInfo(tokenData.access_token);

    // Ищем или создаем пользователя
    const user = await prisma.user.upsert({
      where: { yandexId: userInfo.id },
      update: { email: userInfo.default_email },
      create: {
        email: userInfo.default_email,
        yandexId: userInfo.id,
        role: 'USER',
        employee: {
          create: {
            firstName: userInfo.first_name || '',
            lastName: userInfo.last_name || '',
            position: 'Новый сотрудник',
            department: 'Не назначен',
          },
        },
      },
    });

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Создаем ответ с редиректом
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Устанавливаем cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400
    });

    return response;

  } catch (error) {
    console.error('Yandex OAuth error:', error);
    return NextResponse.redirect('/auth/login?error=oauth_failed');
  }
} 