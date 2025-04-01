import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get user from localStorage (client-side auth)
  const user = request.cookies.get("user")?.value

  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // For admin routes, check if user is admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
      try {
        const userData = JSON.parse(user)
        if (userData.user_type !== "admin") {
          // Redirect to dashboard if not admin
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      } catch (error) {
        // If parsing fails, redirect to login
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}

