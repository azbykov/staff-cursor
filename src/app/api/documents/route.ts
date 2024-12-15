import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
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

    const documents = await prisma.document.findMany({
      where: {
        companyId: decoded.companyId,
        deletedAt: null,
      },
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      uploadedBy: `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`,
      createdAt: doc.createdAt,
      status: doc.status,
    }));

    return Response.json({
      success: true,
      documents: formattedDocuments,
    });

  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return Response.json({
      success: false,
      error: 'Ошибка при получении списка документов',
    }, { status: 500 });
  }
} 