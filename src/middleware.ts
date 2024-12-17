import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` добавляет токен пользователя в `Request`
  function middleware(req) {
    console.log("Middleware executing...", req.nextUrl.pathname)
    console.log("Token:", req.nextauth.token)

    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    
    if (isAdminRoute && req.nextauth.token?.role !== "ADMIN") {
      console.log("Non-admin trying to access admin route")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Auth check, token exists:", !!token)
        return !!token
      }
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ]
}
