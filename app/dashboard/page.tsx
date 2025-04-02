"use client"
<<<<<<< HEAD

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getOrderStats } from "@/lib/supabase/orders"
import { getStoreByOwnerId } from "@/lib/supabase/stores"
import { getProducts } from "@/lib/supabase/products"
import { getPartnershipsByUserId } from "@/lib/supabase/partnerships"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalPartnerships: 0,
    hasStore: false,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadStats() {
      if (!user) return

      try {
        // Get order stats
        const { data: orderStats } = await getOrderStats(user.id, user.user_type)

        // Get store info if wholesaler or dropshipper
        let hasStore = false
        if (user.user_type === "wholesaler" || user.user_type === "dropshipper") {
          const { data: store } = await getStoreByOwnerId(user.id)
          hasStore = !!store
        }

        // Get product count if wholesaler
        let totalProducts = 0
        if (user.user_type === "wholesaler") {
          const { data: products } = await getProducts({ supplierId: user.id })
          totalProducts = products?.length || 0
        }

        // Get partnerships count
        let totalPartnerships = 0
        if (user.user_type === "wholesaler" || user.user_type === "dropshipper") {
          const { data: partnerships } = await getPartnershipsByUserId(
            user.id,
            user.user_type as "wholesaler" | "dropshipper",
          )
          totalPartnerships = partnerships?.filter((p) => p.status === "active").length || 0
        }

        setStats({
          totalOrders: orderStats?.totalOrders || 0,
          pendingOrders: orderStats?.pendingOrders || 0,
          totalRevenue: orderStats?.totalRevenue || 0,
          totalProducts,
          totalPartnerships,
          hasStore,
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {user && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome, {user.full_name}!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Account type: {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
          </p>
        </div>
      )}
=======

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Truck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getUserProfile } from "@/lib/supabase/auth"
import { getProducts } from "@/lib/supabase/products"
import { getOrders } from "@/lib/supabase/orders"
import { getPartnerships } from "@/lib/supabase/partnerships"

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profile = await getUserProfile()
        setUserProfile(profile)

        // Fetch products (for wholesalers or dropshippers)
        if (profile?.user_type === "wholesaler" || profile?.user_type === "dropshipper") {
          const { data: productsData } = await getProducts({ limit: 3 })
          setProducts(productsData || [])
        }

        // Fetch orders
        const { data: ordersData } = await getOrders({ limit: 3 })
        setOrders(ordersData || [])

        // Fetch partnerships (for wholesalers or dropshippers)
        if (profile?.user_type === "wholesaler" || profile?.user_type === "dropshipper") {
          const partnershipsData = await getPartnerships({
            role: profile.user_type as "wholesaler" | "dropshipper",
            status: "active",
          })
          setPartnerships(partnershipsData || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userType = userProfile?.user_type || "customer"

  // Calculate stats
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const activeOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing" || order.status === "shipped",
  ).length
  const newOrdersToday = orders.filter((order) => {
    const orderDate = new Date(order.created_at)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile?.full_name || "User"}! Here's an overview of your {userType} account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {orders.length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">{newOrdersToday} new orders today</p>
          </CardContent>
        </Card>
        {userType === "dropshipper" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">From {partnerships.length} different suppliers</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter((p) => p.stock < 10).length} items low in stock
              </p>
            </CardContent>
          </Card>
        )}
        {userType === "dropshipper" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerships.length}</div>
              <p className="text-xs text-muted-foreground">
                {partnerships.filter((p) => p.status === "pending").length} pending requests
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipments</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter((order) => order.status === "shipped").length}</div>
              <p className="text-xs text-muted-foreground">
                {orders.filter((order) => order.status === "processing").length} pending shipments
              </p>
            </CardContent>
          </Card>
        )}
      </div>
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalOrders}</dd>
              </dl>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all orders
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pendingOrders}</dd>
              </dl>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View pending orders
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</dd>
              </dl>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View details
                </Link>
              </div>
            </div>
          </div>

          {(user?.user_type === "wholesaler" || user?.user_type === "dropshipper") && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Store Status</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.hasStore ? "Active" : "Not Created"}
                    </dd>
                  </dl>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link href="/dashboard/store" className="font-medium text-indigo-600 hover:text-indigo-500">
                      {stats.hasStore ? "Manage store" : "Create store"}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Partnerships</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalPartnerships}</dd>
                  </dl>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link href="/dashboard/partnerships" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Manage partnerships
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
<<<<<<< HEAD

          {user?.user_type === "wholesaler" && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/dashboard/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Manage products
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user?.user_type === "customer" && (
            <>
              <Link
                href="/products"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Shop Products</p>
                  <p className="text-sm text-gray-500 truncate">Browse our catalog</p>
                </div>
              </Link>

              <Link
                href="/cart"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">View Cart</p>
                  <p className="text-sm text-gray-500 truncate">Check your shopping cart</p>
                </div>
              </Link>
            </>
          )}

          {user?.user_type === "wholesaler" && (
            <>
              <Link
                href="/dashboard/products/add"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Add Product</p>
                  <p className="text-sm text-gray-500 truncate">Create a new product listing</p>
                </div>
              </Link>

              <Link
                href="/dashboard/partnerships/requests"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Partnership Requests</p>
                  <p className="text-sm text-gray-500 truncate">Manage dropshipper requests</p>
                </div>
              </Link>
            </>
          )}

          {user?.user_type === "dropshipper" && (
            <>
              <Link
                href="/dashboard/partnerships/find"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Find Wholesalers</p>
                  <p className="text-sm text-gray-500 truncate">Discover new partnership opportunities</p>
                </div>
              </Link>

              <Link
                href="/dashboard/store"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Manage Store</p>
                  <p className="text-sm text-gray-500 truncate">
                    {stats.hasStore ? "Update your store" : "Create your store"}
                  </p>
                </div>
              </Link>
            </>
          )}

          <Link
            href="/settings"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Account Settings</p>
              <p className="text-sm text-gray-500 truncate">Update your profile information</p>
            </div>
          </Link>
        </div>
      </div>
=======
        </TabsList>
        <TabsContent value="recent-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {orders.length} orders this month.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.slice(0, 3).map((order) => {
                  // Get first item image
                  const firstItem = order.order_items?.[0]
                  const primaryImage = firstItem?.products?.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    firstItem?.products?.product_images?.[0]?.url ||
                    "/placeholder.svg?height=80&width=80&text=No+Image"

                  return (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Order #{order.id.slice(0, 8)}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Status:</div>
                          <div className="text-sm font-medium">
                            {order.status === "pending" ? (
                              <span className="text-yellow-500">Pending</span>
                            ) : order.status === "processing" ? (
                              <span className="text-yellow-500">Processing</span>
                            ) : order.status === "shipped" ? (
                              <span className="text-blue-500">Shipped</span>
                            ) : order.status === "delivered" ? (
                              <span className="text-green-500">Delivered</span>
                            ) : (
                              <span className="text-red-500">Cancelled</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Date:</div>
                          <div className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Total:</div>
                          <div className="text-sm font-medium">RWF {order.total.toLocaleString()}</div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/order-tracking/${order.id}`}>
                            View Details
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>You have {products.length} products in your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product) => {
                  // Find primary image
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    product.product_images?.[0]?.url ||
                    "/placeholder.svg?height=200&width=200&text=No+Image"

                  return (
                    <Card key={product.id}>
                      <CardHeader className="pb-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">RWF {product.price.toLocaleString()}</p>
                        <div className="mt-2 flex items-center text-sm">
                          <span className={product.stock > 10 ? "text-green-500" : "text-yellow-500"}>
                            {product.stock > 10 ? "In Stock" : "Low Stock"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            Edit Product
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/products">View All Products</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Inventory</CardTitle>
              <CardDescription>You have {products.length} items in your inventory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product) => {
                  // Find primary image
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
                  const imageUrl =
                    primaryImage?.url ||
                    product.product_images?.[0]?.url ||
                    "/placeholder.svg?height=200&width=200&text=No+Image"

                  return (
                    <Card key={product.id}>
                      <CardHeader className="pb-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">RWF {product.price.toLocaleString()}</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span>Stock:</span>
                          <span className={product.stock > 10 ? "text-green-500" : "text-yellow-500"}>
                            {product.stock} units
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/inventory/${product.id}`}>
                            Manage Stock
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/inventory">View All Inventory</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
    </div>
  )
}

