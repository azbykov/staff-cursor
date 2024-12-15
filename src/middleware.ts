import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Типы
type Rule = (token: string | undefined, url: string, role?: string) => NextResponse | null;

type RouteConfig = {
  url: string;
  rules: Rule[];
};

// Утилита для сопоставления путей
function matchPath(pattern: string, pathname: string): boolean {
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+')
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

// Правила
const isAuthenticatedRule: Rule = (token, url) => {
  if (!token) {
    console.log('No token, redirecting to login');
    const loginUrl = new URL('/auth/login', url);
    loginUrl.searchParams.set('callbackUrl', url);
    return NextResponse.redirect(loginUrl);
  }
  return null;
};

const isAdminRule: Rule = (token, url) => {
  if (!token) return null;

  // Простая проверка на наличие токена для админских путей
  if (!token) {
    console.log('Not admin, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', url));
  }
  return null;
};

const isPublicRouteRule: Rule = (token, url) => {
  if (token) {
    console.log('Token exists, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', url));
  }
  return null;
};

// Конфигурация маршрутов
const routesConfig: RouteConfig[] = [
  // Административные маршруты
  {
    url: '/admin',
    rules: [isAuthenticatedRule, isAdminRule],
  },
  {
    url: '/admin/:path*',
    rules: [isAuthenticatedRule, isAdminRule],
  },
  // Защищенные маршруты
  {
    url: '/dashboard',
    rules: [isAuthenticatedRule],
  },
  {
    url: '/dashboard/:path*',
    rules: [isAuthenticatedRule],
  },
  // Публичные маршруты
  {
    url: '/auth/login',
    rules: [isPublicRouteRule],
  },
  {
    url: '/auth/register',
    rules: [isPublicRouteRule],
  },
];

// Выполнение правил
function executeRules(
  rules: Rule[],
  token: string | undefined,
  url: string,
): NextResponse | null {
  for (const rule of rules) {
    const result = rule(token, url);
    if (result) return result;
  }
  return null;
}

// Middleware
export async function middleware(request: NextRequest) {
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  const token = request.cookies.get('token')?.value;
  console.log('Token exists:', !!token);

  const currentRouteConfig = routesConfig.find((route) =>
    matchPath(route.url, request.nextUrl.pathname)
  );

  console.log('Route config found:', !!currentRouteConfig);

  if (!currentRouteConfig) {
    console.log('No route config, proceeding');
    return NextResponse.next();
  }

  const result = executeRules(
    currentRouteConfig.rules,
    token,
    request.url
  );

  console.log('Rules execution result:', !!result);

  if (result) {
    console.log('Redirecting to:', result.headers.get('Location'));
  }

  return result || NextResponse.next();
}

// Конфигурация путей для middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
