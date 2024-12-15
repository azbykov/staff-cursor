import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  try {
    // Получаем токен из куки
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return Response.json({
        success: false,
        error: 'Не авторизован'
      }, { status: 401 });
    }

    // Декодируем токен
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      companyId: string;
      role: string;
    };

    if (decoded.role !== 'COMPANY_OWNER') {
      return Response.json({
        success: false,
        error: 'Доступ запрещен'
      }, { status: 403 });
    }

    const employees = await prisma.employee.findMany({
      where: {
        companyId: decoded.companyId,
        deletedAt: null,
      },
      include: {
        department: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      email: emp.user.email,
      phone: emp.phone,
    }));

    return Response.json({
      success: true,
      employees: formattedEmployees,
    });

  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return Response.json({
      success: false,
      error: 'Ошибка при получении списка сотрудников',
    }, { status: 500 });
  }
} 