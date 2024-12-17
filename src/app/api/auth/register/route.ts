import { NextResponse } from 'next/server';
import { PrismaClient, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { company, user } = await request.json();
    
    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Пользователь с таким email уже существует'
      }, { status: 400 });
    }

    // Используем транзакцию для создания всех сущностей
    const result = await prisma.$transaction(async (tx) => {
      // 1. Создаем компанию
      const newCompany = await tx.company.create({
        data: {
          name: company.name,
          industry: company.industry,
          size: company.size,
          phone: company.phone || '',
          status: 'active',
        },
      });

      // 2. Создаем пользователя
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await tx.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: Role.COMPANY_OWNER,
        },
      });

      // 3. Создаем департамент
      const defaultDepartment = await tx.department.create({
        data: {
          name: 'Главный офис',
          companyId: newCompany.id,
          description: 'Основной департамент компании',
        },
      });

      // 4. Создаем сотрудника
      const newEmployee = await tx.employee.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          position: 'CEO',
          status: 'active',
          companyId: newCompany.id,
          userId: newUser.id,
          departmentId: defaultDepartment.id,
          phone: company.phone || '',
        },
      });

      return { newCompany, newUser, newEmployee };
    });

    // Создаем JWT токен
    const token = jwt.sign({
      userId: result.newUser.id,
      email: result.newUser.email,
      role: result.newUser.role,
      companyId: result.newCompany.id
    }, JWT_SECRET, { expiresIn: '24h' });

    return NextResponse.json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        companyId: result.newCompany.id,
        userId: result.newUser.id,
        employeeId: result.newEmployee.id,
        token: token,
        user: {
          id: result.newUser.id,
          email: result.newUser.email,
          role: result.newUser.role,
          firstName: result.newEmployee.firstName,
          lastName: result.newEmployee.lastName
        }
      }
    }, {
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при регистрации',
      details: error.message
    }, { status: 500 });
  }
} 