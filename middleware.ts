<<<<<<< HEAD
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
=======
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth protection for dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard") && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth protection for admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

    if (!profile || profile.user_type !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return res
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}

