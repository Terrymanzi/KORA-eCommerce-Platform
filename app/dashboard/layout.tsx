"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
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
import { signOut, getUserProfile } from "@/lib/supabase/auth"

export default function DashboardLayout({
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
        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

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

  const userType = userProfile?.user_type || "customer"
  const userName = userProfile?.full_name || "User"

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
                      <ShoppingBag className="h-5 w-5" />
                    </Link>
                    <span className="text-lg font-bold">KORA</span>
                  </div>
                  <nav className="flex-1 overflow-auto py-4">
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                      {userType === "dropshipper" && (
                        <>
                          <Link
                            href="/dashboard/products"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Package className="h-4 w-4" />
                            Products
                          </Link>
                          <Link
                            href="/dashboard/store"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            My Store
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Orders
                          </Link>
                          <Link
                            href="/dashboard/partnerships"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            Partnerships
                          </Link>
                        </>
                      )}
                      {userType === "wholesaler" && (
                        <>
                          <Link
                            href="/dashboard/inventory"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Package className="h-4 w-4" />
                            Inventory
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Orders
                          </Link>
                          <Link
                            href="/dashboard/shipments"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Truck className="h-4 w-4" />
                            Shipments
                          </Link>
                          <Link
                            href="/dashboard/partners"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            Partners
                          </Link>
                        </>
                      )}
                      <Link
                        href="/dashboard/settings"
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
              <ShoppingBag className="h-5 w-5" />
              <span className="text-lg font-bold hidden md:inline-block">KORA</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline-block">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
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
            <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            {userType === "dropshipper" && (
              <>
                <Link
                  href="/dashboard/products"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <Package className="h-4 w-4" />
                  Products
                </Link>
                <Link
                  href="/dashboard/store"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <Store className="h-4 w-4" />
                  My Store
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  href="/dashboard/partnerships"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <Users className="h-4 w-4" />
                  Partnerships
                </Link>
              </>
            )}
            {userType === "wholesaler" && (
              <>
                <Link
                  href="/dashboard/inventory"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <Package className="h-4 w-4" />
                  Inventory
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  href="/dashboard/shipments"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <Truck className="h-4 w-4" />
                  Shipments
                </Link>
                <Link
                  href="/dashboard/partners"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <Users className="h-4 w-4" />
                  Partners
                </Link>
              </>
            )}
            <Link
              href="/dashboard/settings"
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

