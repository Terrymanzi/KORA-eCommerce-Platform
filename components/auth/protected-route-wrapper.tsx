"use client"

import type React from "react"
import dynamic from "next/dynamic"
import type { UserRole } from "@/services/user-service"

// Dynamically import ProtectedRoute with no SSR
const ProtectedRouteNoSSR = dynamic(() => import("@/components/protected-route"), {
  ssr: false,
})

interface ProtectedRouteWrapperProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export default function ProtectedRouteWrapper({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteWrapperProps) {
  return (
    <ProtectedRouteNoSSR allowedRoles={allowedRoles} redirectTo={redirectTo}>
      {children}
    </ProtectedRouteNoSSR>
  )
}