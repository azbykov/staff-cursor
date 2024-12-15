import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    const userResponse = await fetch('https://login.yandex.ru/info', {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const yandexUser = await userResponse.json();

    const user = await prisma.user.upsert({
      where: { email: yandexUser.default_email },
      update: {
        name: yandexUser.real_name || yandexUser.display_name,
      },
      create: {
        email: yandexUser.default_email,
        name: yandexUser.real_name || yandexUser.display_name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Создаем JWT токен
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ user });

    // Устанавливаем куки
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 // 24 часа
    });

    return response;

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
  }
} 