import { NextResponse } from 'next/server';
import { PrismaClient, Prisma, Company, Department, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let newCompany: Company | null = null;
let newUser: User | null = null;
let defaultDepartment: Department | null = null;

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'EMPLOYEE'
      }
    });

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    console.log('Existing user check:', existingUser);

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Пользователь с таким email уже существует'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Создаем компанию
    newCompany = await prisma.company.create({
      data: {
        name: 'New Company',
        industry: 'New Industry',
        size: 100,
        phone: '',
        status: 'active',
      },
    });
    console.log('Company created:', JSON.stringify(newCompany, null, 2));

    // Создаем пользователя
    newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: 'COMPANY_OWNER',
      },
    });
    console.log('User created:', JSON.stringify(newUser, null, 2));

    // Создаем департамент
    defaultDepartment = await prisma.department.create({
      data: {
        name: 'Главный офис',
        companyId: newCompany.id,
        description: 'Основной департамент компании',
      },
    });
    console.log('Department created:', JSON.stringify(defaultDepartment, null, 2));

    // Создаем сотрудника
    console.log('Creating employee with data:', JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      position: 'CEO',
      status: 'active',
      companyId: newCompany.id,
      userId: newUser.id,
      departmentId: defaultDepartment.id,
      phone: '',
    }, null, 2));

    const newEmployee = await prisma.employee.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        position: 'CEO',
        status: 'active',
        companyId: newCompany.id,
        userId: newUser.id,
        departmentId: defaultDepartment.id,
        phone: '',
      },
    });
    console.log('Employee created:', JSON.stringify(newEmployee, null, 2));
    console.log({'newUser.id': newUser.id, 'newCompany.id': newCompany.id});

    // Удаляем транзакцию, так как все записи уже созданы
    console.log('All entities created successfully');

    // После успешного создания всех сущностей создаем JWT токен
    const token = jwt.sign({ 
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      companyId: newCompany.id
    }, 
    JWT_SECRET,
    { 
      expiresIn: '24h' 
    });

    // Обновляем время последнего входа
    await prisma.user.update({
      where: { id: newUser.id },
      data: { lastLogin: new Date() }
    });

    // Возвращаем ответ с токеном
    return new Response(JSON.stringify({
      success: true,
      message: 'Регистрация успешна',
      data: {
        companyId: newCompany.id,
        userId: newUser.id,
        employeeId: newEmployee.id,
        token: token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName
        }
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      }
    });

  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return Response.json({
      success: false,
      error: 'Ошибка при регистрации',
      details: error.message
    }, { 
      status: 500 
    });
  }
} 