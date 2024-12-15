import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return Response.json({
        success: false,
        error: 'Не авторизован'
      }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        companyId: string;
        role: string;
      };
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return Response.json({
        success: false,
        error: 'Недействительный токен'
      }, { status: 401 });
    }

    if (!decoded || !decoded.companyId) {
      return Response.json({
        success: false,
        error: 'Некорректные данные токена'
      }, { status: 401 });
    }

    console.log({decoded});

    const departments = await prisma.department.findMany({
      where: {
        companyId: decoded.companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return Response.json({
      success: true,
      departments
    });

  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return Response.json({
      success: false,
      error: 'Ошибка при получении списка департаментов'
    }, { status: 500 });
  }
} 