"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/services/user-service"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export default function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, userData, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip during SSR
    if (typeof window === "undefined") return

    // Wait until auth state is determined
    if (loading) return

    // If not logged in, redirect to login
    if (!user) {
      router.push(redirectTo)
      return
    }

    // If roles are specified, check if user has required role
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some((role) => hasRole(role))

      if (!hasAllowedRole) {
        // Redirect based on user role
        if (userData?.role === "customer") {
          router.push("/dashboard")
        } else if (userData?.role === "wholesaler") {
          router.push("/dashboard/store")
        } else if (userData?.role === "dropshipper") {
          router.push("/dashboard/partnerships")
        } else if (userData?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    }
  }, [user, userData, loading, hasRole, allowedRoles, router, redirectTo])

  // Show nothing while loading or redirecting
  if (loading || !user || (allowedRoles && allowedRoles.length > 0 && !allowedRoles.some((role) => hasRole(role)))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

