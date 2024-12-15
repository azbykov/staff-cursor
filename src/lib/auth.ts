import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Добавляем роль пользователя в токен
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Добавляем роль в объект сессии
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  // ... остальные настройки
}; 