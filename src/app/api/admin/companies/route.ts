import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        deletedAt: null
      },
      include: {
        employees: {
          where: {
            deletedAt: null,
          },
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: companies
    });
    
  } catch (error) {
    console.error('Get companies error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при получении списка компаний' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const company = await prisma.$transaction(async (tx) => {
      // Создаем компанию
      const newCompany = await tx.company.create({
        data: {
          name: data.name,
          status: 'active'
        }
      });

      // Создаем пользователя-владельца
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'COMPANY_OWNER',
          employee: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              position: 'Owner',
              companyId: newCompany.id,
              status: 'active'
            }
          }
        },
        include: {
          employee: true
        }
      });

      // Создаем приглашение
      const invitation = await tx.invitation.create({
        data: {
          email: data.email,
          token: uuidv4(),
          companyId: newCompany.id,
          role: 'COMPANY_OWNER',
          authType: 'PASSWORD',
          userId: newUser.id
        }
      });

      return {
        ...newCompany,
        owner: newUser
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Компания успешно создана',
      data: company
    });
  } catch (error) {
    console.error('Error creating company:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при создании компании и владельца' 
      },
      { status: 500 }
    );
  }
}