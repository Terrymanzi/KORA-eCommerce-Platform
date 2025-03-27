'use client'

import dynamic from 'next/dynamic'

const AuthProviderNoSSR = dynamic(
  () => import('@/contexts/auth-context').then((mod) => mod.AuthProvider),
  { ssr: false }
)

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProviderNoSSR>{children}</AuthProviderNoSSR>
}