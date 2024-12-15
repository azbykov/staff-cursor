import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return Response.json({
        success: false,
        error: 'Не авторизован'
      }, { status: 401 });
    }

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

    const { email, firstName, lastName, position, departmentId } = await request.json();
    
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: 'EMPLOYEE',
        employee: {
          create: {
            firstName,
            lastName,
            position,
            departmentId
          }
        }
      }
    });

    // Создаем приглашение
    const invitation = await prisma.invitation.create({
      data: {
        email: user.email,
        token: uuidv4(),
        companyId: decoded.companyId,
        departmentId: departmentId,
        role: 'EMPLOYEE',
        authType: 'PASSWORD',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      },
    });

    return Response.json({
      success: true,
      message: 'Сотрудник успешно создан',
      data: {
        employeeId: user.employee.id,
        userId: user.id,
        email: user.email,
        invitationToken: invitation.token
      }
    });

  } catch (error: any) {
    console.error('Error creating employee:', error);
    return Response.json({
      success: false,
      error: 'Ошибка при создании сотрудника',
      details: error.message
    }, { status: 500 });
  }
} 