"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bell,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  User,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { getUserProfile, signOut } from "@/lib/supabase/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile()

        // Check if user is admin
        if (!profile || profile.user_type !== "admin") {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin area.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router, toast])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 border-b py-4">
                    <Link href="/">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </Link>
                    <span className="text-lg font-bold">KORA Admin</span>
                  </div>
                  <nav className="flex-1 overflow-auto py-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      Back to Site
                    </Link>
                    <div className="my-2 h-px bg-border" />
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/users"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        Users
                      </Link>
                      <Link
                        href="/admin/products"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        Products
                      </Link>
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        href="/admin/stores"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Store className="h-4 w-4" />
                        Stores
                      </Link>
                      <Link
                        href="/admin/payments"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <CreditCard className="h-4 w-4" />
                        Payments
                      </Link>
                      <Link
                        href="/admin/analytics"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BarChart className="h-4 w-4" />
                        Analytics
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold hidden md:inline-block">KORA Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                5
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline-block">{userProfile?.full_name || "Admin"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="flex flex-col gap-1 p-4">
            <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <Home className="h-4 w-4" />
              Back to Site
            </Link>
            <div className="my-2 h-px bg-border" />
            <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <Users className="h-4 w-4" />
              Users
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Link>
            <Link href="/admin/stores" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <Store className="h-4 w-4" />
              Stores
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <CreditCard className="h-4 w-4" />
              Payments
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <BarChart className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

