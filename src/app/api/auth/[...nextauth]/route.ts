import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import YandexProvider from "next-auth/providers/yandex";
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';

const prisma = new PrismaClient();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Необходимо указать email и пароль');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            employee: true
          }
        });

        if (!user || !user.password) {
          throw new Error('Пользователь не найден');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Неверный пароль');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/auth/welcome'
  },
  theme: {
    colorScheme: 'light',
    brandColor: '#0f0a2c',
    logo: '/images/logo.png',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'yandex') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            console.log('User not found:', user.email);
            throw new Error('Пользователь не зарегистрирован в системе');
          }

          user.id = existingUser.id;
          user.role = existingUser.role;
          user.image = profile?.avatar_url || profile?.picture;
          
          return true;
        } catch (error) {
          console.error('SignIn error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 