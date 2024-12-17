import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session in /api/users/me:", session)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Не авторизован" }),
        { status: 401 }
      )
    }

    // Получаем расширенные данные пользователя из базы
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employee: {
          select: {
            position: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      user 
    })
  } catch (error) {
    console.error("Error in /api/users/me:", error)
    return new NextResponse(
      JSON.stringify({ error: "Внутренняя ошибка сервера" }),
      { status: 500 }
    )
  }
} 