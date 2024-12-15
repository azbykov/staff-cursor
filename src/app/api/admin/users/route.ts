import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        employee: {
          deletedAt: null
        }
      },
      include: {
        employee: {
          include: {
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении списка пользователей' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const hashedPassword = await bcrypt.hash('defaultPassword', 10); // Временный пароль

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        employee: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            position: data.position,
            companyId: data.companyId,
            departmentId: data.departmentId,
            status: 'active'
          }
        }
      },
      include: {
        employee: true
      }
    });

    // TODO: Отпра��ить email с временным паролем

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя' },
      { status: 500 }
    );
  }
} 